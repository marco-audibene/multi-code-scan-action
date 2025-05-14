const github = require("@actions/github")
const { exec } = require("@actions/exec")
const files = require("../../src/utils/files")

// Mock GitHub
jest.mock("@actions/github", () => ({
  getOctokit: jest.fn().mockReturnValue({
    rest: {
      pulls: {
        listFiles: jest.fn(),
      },
    },
  }),
  context: {
    repo: {
      owner: "test-owner",
      repo: "test-repo",
    },
    payload: {
      pull_request: {
        number: 123,
      },
    },
  },
}))

// Mock exec
jest.mock("@actions/exec", () => ({
  exec: jest.fn(),
}))

describe("files", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getChangedFiles", () => {
    it("should get files changed in PR that match sourcePath", async () => {
      const mockFiles = [
        { filename: "src/file1.js", status: "added" },
        { filename: "src/file2.js", status: "modified" },
        { filename: "test/file3.js", status: "added" }, // Should be filtered out
      ]

      github.getOctokit().rest.pulls.listFiles.mockResolvedValueOnce({ data: mockFiles })

      const result = await files.getChangedFiles("token", "src/")

      expect(result.totalFiles).toBe(3)
      expect(result.newFiles).toContain("src/file1.js")
      expect(result.modifiedFiles).toContain("src/file2.js")
      expect(result.filteredFiles).toHaveLength(2)
      expect(result.filteredFiles).not.toContain("test/file3.js")
    })

    it("should handle glob patterns in sourcePath", async () => {
      const mockFiles = [
        { filename: "src/dir1/file1.js", status: "added" },
        { filename: "src/dir2/file2.js", status: "modified" },
        { filename: "test/file3.js", status: "added" }, // Should be filtered out
      ]

      github.getOctokit().rest.pulls.listFiles.mockResolvedValueOnce({ data: mockFiles })

      const result = await files.getChangedFiles("token", "src/**")

      expect(result.totalFiles).toBe(3)
      expect(result.newFiles).toContain("src/dir1/file1.js")
      expect(result.modifiedFiles).toContain("src/dir2/file2.js")
      expect(result.filteredFiles).toHaveLength(2)
    })
  })

  describe("getAllFiles", () => {
    it("should get all files in repository that match sourcePath", async () => {
      // Mock git ls-files output
      exec.mockImplementationOnce((cmd, args, options) => {
        options.listeners.stdout("src/file1.js\nsrc/file2.js\ntest/file3.js")
        return Promise.resolve(0)
      })

      const result = await files.getAllFiles("src/")

      expect(result.totalFiles).toBe(3)
      expect(result.filteredFiles).toHaveLength(2)
      expect(result.filteredFiles).toContain("src/file1.js")
      expect(result.filteredFiles).toContain("src/file2.js")
      expect(result.filteredFiles).not.toContain("test/file3.js")
    })

    it("should handle glob patterns in sourcePath", async () => {
      // Mock git ls-files output
      exec.mockImplementationOnce((cmd, args, options) => {
        options.listeners.stdout("src/dir1/file1.js\nsrc/dir2/file2.js\ntest/file3.js")
        return Promise.resolve(0)
      })

      const result = await files.getAllFiles("src/**")

      expect(result.totalFiles).toBe(3)
      expect(result.filteredFiles).toHaveLength(2)
      expect(result.filteredFiles).toContain("src/dir1/file1.js")
      expect(result.filteredFiles).toContain("src/dir2/file2.js")
    })
  })

  describe("filterFilesByType", () => {
    it("should filter files based on file type configuration", () => {
      const fileType = {
        sourcePath: "src/",
        fileExtensions: [".js", ".jsx"],
      }

      const allFiles = [
        "src/file1.js",
        "src/file2.jsx",
        "src/file3.css", // Should be filtered out
        "test/file4.js", // Should be filtered out
      ]

      const result = files.filterFilesByType(fileType, allFiles)

      expect(result).toHaveLength(2)
      expect(result).toContain("src/file1.js")
      expect(result).toContain("src/file2.jsx")
      expect(result).not.toContain("src/file3.css")
      expect(result).not.toContain("test/file4.js")
    })
  })
})
