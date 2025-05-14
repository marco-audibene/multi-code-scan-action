const path = require("path")
const fs = require("fs").promises
const formatter = require("../../src/utils/formatter")
const logger = require("../../src/utils/logger")

// Mock the logger
jest.mock("../../src/utils/logger", () => ({
  logInfo: jest.fn(),
  logWarning: jest.fn(),
  colors: {
    dim: "",
    bright: "",
    reset: "",
  },
}))

// Mock core
jest.mock("@actions/core", () => ({
  info: jest.fn(),
}))

// Mock fs.promises
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}))

describe("formatter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("setProjectRootPath", () => {
    it("should set project root path and log info", () => {
      const rootPath = "/path/to/project"
      formatter.setProjectRootPath(rootPath)
      expect(logger.logInfo).toHaveBeenCalledWith(expect.stringContaining(rootPath))
    })
  })

  describe("normalizeFilePath", () => {
    it("should normalize file path with source path", () => {
      const filePath = "/home/runner/work/repo/src/file.js"
      const sourcePath = "src/"
      const result = formatter.normalizeFilePath(filePath, sourcePath)
      expect(result).toContain("src/")
      expect(result).toContain("file.js")
    })

    it("should handle undefined file path", () => {
      const result = formatter.normalizeFilePath(undefined, "src/")
      expect(result).toBeUndefined()
    })

    it("should handle workspace prefixes", () => {
      const filePath = "/github/workspace/src/file.js"
      const result = formatter.normalizeFilePath(filePath, "src/")
      expect(result).not.toContain("/github/workspace/")
      expect(result).toContain("src/")
      expect(result).toContain("file.js")
    })
  })

  describe("createTempFile", () => {
    it("should create a temporary file", async () => {
      const filePath = "temp.txt"
      const content = "test content"

      const result = await formatter.createTempFile(filePath, content)

      expect(result).toBe(filePath)
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, content)
    })

    it("should throw error if file creation fails", async () => {
      const filePath = "temp.txt"
      const content = "test content"
      const error = new Error("File creation failed")

      fs.writeFile.mockRejectedValueOnce(error)

      await expect(formatter.createTempFile(filePath, content)).rejects.toThrow(error)
      expect(logger.logWarning).toHaveBeenCalled()
    })
  })

  describe("cleanupTempFiles", () => {
    it("should clean up temporary files", async () => {
      const filePaths = ["temp1.txt", "temp2.txt"]

      await formatter.cleanupTempFiles(filePaths)

      expect(fs.unlink).toHaveBeenCalledTimes(2)
      expect(fs.unlink).toHaveBeenCalledWith("temp1.txt")
      expect(fs.unlink).toHaveBeenCalledWith("temp2.txt")
    })

    it("should handle errors during cleanup", async () => {
      const filePaths = ["temp1.txt", "temp2.txt"]
      const error = new Error("Cleanup failed")

      fs.unlink.mockRejectedValueOnce(error)

      await formatter.cleanupTempFiles(filePaths)

      expect(logger.logWarning).toHaveBeenCalled()
      expect(fs.unlink).toHaveBeenCalledTimes(2)
    })
  })
})
