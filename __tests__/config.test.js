const core = require("@actions/core")
const github = require("@actions/github")
const { loadConfig } = require("../src/config")

// Mock @actions/core
jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
}))

// Mock @actions/github
jest.mock("@actions/github", () => ({
  context: {
    eventName: "pull_request",
    payload: {
      pull_request: {
        number: 123,
      },
    },
  },
}))

describe("config", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("loadConfig", () => {
    it("should load and parse all configuration from GitHub Action inputs", () => {
      // Mock input values
      core.getInput.mockImplementation((name) => {
        const inputs = {
          "github-token": "mock-token",
          sourcePath: "src/",
          "file-types-config": JSON.stringify([
            {
              name: "JavaScript",
              sourcePath: "src/",
              fileExtensions: [".js"],
              analyzer: "eslint",
            },
          ]),
          "check-name": "Code Quality Check",
          scanChangedFilesOnly: "true",
          enableScanCache: "true",
          outputFormats: "github,json",
          maxCriticalViolations: "0",
          maxMediumViolations: "10",
          previousViolationsFile: "",
          failOnQualityIssues: "true",
          strictNewFiles: "true",
          maxViolationsForModifiedFiles: "10",
          maxCriticalViolationsForModifiedFiles: "0",
        }
        return inputs[name] || ""
      })

      // Call the function
      const config = loadConfig()

      // Verify the result
      expect(config).toEqual({
        token: "mock-token",
        sourcePath: "src/",
        fileTypesConfig: [
          {
            name: "JavaScript",
            sourcePath: "src/",
            fileExtensions: [".js"],
            analyzer: "eslint",
          },
        ],
        checkName: "Code Quality Check",
        scanChangedFilesOnly: true,
        enableScanCache: true,
        outputFormats: ["github", "json"],
        maxCriticalViolations: 0,
        maxMediumViolations: 10,
        previousViolationsFile: "",
        failOnQualityIssues: true,
        isPullRequest: true,
        strictNewFiles: true,
        maxViolationsForModifiedFiles: 10,
        maxCriticalViolationsForModifiedFiles: 0,
      })

      // Verify core.getInput was called for each input
      expect(core.getInput).toHaveBeenCalledWith("github-token")
      expect(core.getInput).toHaveBeenCalledWith("sourcePath")
      expect(core.getInput).toHaveBeenCalledWith("file-types-config")
      expect(core.getInput).toHaveBeenCalledWith("check-name")
      expect(core.getInput).toHaveBeenCalledWith("scanChangedFilesOnly")
      expect(core.getInput).toHaveBeenCalledWith("enableScanCache")
      expect(core.getInput).toHaveBeenCalledWith("outputFormats")
      expect(core.getInput).toHaveBeenCalledWith("maxCriticalViolations")
      expect(core.getInput).toHaveBeenCalledWith("maxMediumViolations")
      expect(core.getInput).toHaveBeenCalledWith("previousViolationsFile")
      expect(core.getInput).toHaveBeenCalledWith("failOnQualityIssues")
      expect(core.getInput).toHaveBeenCalledWith("strictNewFiles")
      expect(core.getInput).toHaveBeenCalledWith("maxViolationsForModifiedFiles")
      expect(core.getInput).toHaveBeenCalledWith("maxCriticalViolationsForModifiedFiles")
    })

    it("should handle non-PR events", () => {
      // Mock input values
      core.getInput.mockImplementation((name) => {
        const inputs = {
          "github-token": "mock-token",
          sourcePath: "src/",
          "file-types-config": JSON.stringify([]),
          "check-name": "Code Quality Check",
        }
        return inputs[name] || ""
      })

      // Mock github context for a non-PR event
      github.context.eventName = "push"

      // Call the function
      const config = loadConfig()

      // Verify isPullRequest is false
      expect(config.isPullRequest).toBe(false)

      // Restore github context
      github.context.eventName = "pull_request"
    })

    it("should throw an error if configuration loading fails", () => {
      // Mock getInput to throw an error
      core.getInput.mockImplementation(() => {
        throw new Error("Input error")
      })

      // Expect loadConfig to throw an error
      expect(() => loadConfig()).toThrow("Failed to load configuration: Input error")
    })

    it("should handle invalid JSON in file-types-config", () => {
      // Mock input values with invalid JSON
      core.getInput.mockImplementation((name) => {
        if (name === "file-types-config") {
          return "invalid-json"
        }
        return ""
      })

      // Expect loadConfig to throw an error
      expect(() => loadConfig()).toThrow("Failed to load configuration")
    })
  })
})
