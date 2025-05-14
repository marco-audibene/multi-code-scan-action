const core = require("@actions/core")
const { runAnalysis } = require("../../src/analyzers/analyzer")
const { filterFilesByType } = require("../../src/utils/files")
const { runPMD } = require("../../src/analyzers/pmd")
const { runESLint } = require("../../src/analyzers/eslint")
const logger = require("../../src/utils/logger")

// Mock dependencies
jest.mock("@actions/core", () => ({
  info: jest.fn(),
}))

jest.mock("../../src/utils/files", () => ({
  filterFilesByType: jest.fn(),
}))

jest.mock("../../src/analyzers/pmd", () => ({
  runPMD: jest.fn(),
}))

jest.mock("../../src/analyzers/eslint", () => ({
  runESLint: jest.fn(),
}))

jest.mock("../../src/utils/logger", () => ({
  logSuccess: jest.fn(),
  logWarning: jest.fn(),
  logInfo: jest.fn(),
  logSubsectionHeader: jest.fn(),
  colors: {
    bright: "",
    reset: "",
  },
}))

describe("analyzer", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("runAnalysis", () => {
    it("should run analysis for each file type", async () => {
      // Mock file types configuration
      const fileTypesConfig = [
        {
          name: "JavaScript",
          analyzer: "eslint",
          sourcePath: "src/",
          fileExtensions: [".js"],
        },
        {
          name: "Java",
          analyzer: "pmd",
          sourcePath: "java/",
          fileExtensions: [".java"],
        },
      ]

      // Mock files
      const allFiles = ["src/file1.js", "java/File1.java"]

      // Mock filterFilesByType to return different files for each file type
      filterFilesByType
        .mockReturnValueOnce(["src/file1.js"]) // For JavaScript
        .mockReturnValueOnce(["java/File1.java"]) // For Java

      // Mock analyzer results
      runESLint.mockResolvedValueOnce([{ file: "src/file1.js", rule: "no-console", severity: "medium" }])
      runPMD.mockResolvedValueOnce([{ file: "java/File1.java", rule: "UnusedVariable", severity: "high" }])

      // Run the analysis
      const result = await runAnalysis(fileTypesConfig, allFiles, false)

      // Verify the results
      expect(result).toHaveLength(2)
      expect(result[0].file).toBe("src/file1.js")
      expect(result[1].file).toBe("java/File1.java")

      // Verify the analyzers were called
      expect(filterFilesByType).toHaveBeenCalledTimes(2)
      expect(runESLint).toHaveBeenCalledTimes(1)
      expect(runPMD).toHaveBeenCalledTimes(1)

      // Verify logging
      expect(logger.logSubsectionHeader).toHaveBeenCalledWith("Analyzing JavaScript files with eslint")
      expect(logger.logSubsectionHeader).toHaveBeenCalledWith("Analyzing Java files with pmd")
    })

    it("should handle empty file lists", async () => {
      // Mock file types configuration
      const fileTypesConfig = [
        {
          name: "JavaScript",
          analyzer: "eslint",
          sourcePath: "src/",
          fileExtensions: [".js"],
        },
      ]

      // Mock files
      const allFiles = []

      // Mock filterFilesByType to return empty array
      filterFilesByType.mockReturnValueOnce([])

      // Run the analysis
      const result = await runAnalysis(fileTypesConfig, allFiles, false)

      // Verify the results
      expect(result).toHaveLength(0)

      // Verify the analyzers were not called
      expect(runESLint).not.toHaveBeenCalled()
      expect(runPMD).not.toHaveBeenCalled()

      // Verify logging
      expect(logger.logSuccess).toHaveBeenCalledWith("No JavaScript files to scan")
    })

    it("should handle unknown analyzers", async () => {
      // Mock file types configuration with unknown analyzer
      const fileTypesConfig = [
        {
          name: "Unknown",
          analyzer: "unknown",
          sourcePath: "src/",
          fileExtensions: [".txt"],
        },
      ]

      // Mock files
      const allFiles = ["src/file1.txt"]

      // Mock filterFilesByType
      filterFilesByType.mockReturnValueOnce(["src/file1.txt"])

      // Run the analysis
      const result = await runAnalysis(fileTypesConfig, allFiles, false)

      // Verify the results
      expect(result).toHaveLength(0)

      // Verify warning was logged
      expect(logger.logWarning).toHaveBeenCalledWith("Unknown analyzer: unknown")
    })

    it("should handle analyzer errors", async () => {
      // Mock file types configuration
      const fileTypesConfig = [
        {
          name: "JavaScript",
          analyzer: "eslint",
          sourcePath: "src/",
          fileExtensions: [".js"],
        },
      ]

      // Mock files
      const allFiles = ["src/file1.js"]

      // Mock filterFilesByType
      filterFilesByType.mockReturnValueOnce(["src/file1.js"])

      // Mock analyzer error
      runESLint.mockRejectedValueOnce(new Error("Analyzer error"))

      // Run the analysis
      const result = await runAnalysis(fileTypesConfig, allFiles, false)

      // Verify the results
      expect(result).toHaveLength(0)

      // Verify warning was logged
      expect(logger.logWarning).toHaveBeenCalledWith("Error running eslint on JavaScript files: Analyzer error")
    })
  })
})
