const fs = require("fs").promises
const baseline = require("../../src/utils/baseline")
const logger = require("../../src/utils/logger")

// Mock the logger
jest.mock("../../src/utils/logger", () => ({
  logInfo: jest.fn(),
  logWarning: jest.fn(),
}))

// Mock fs.promises
jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}))

describe("baseline", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("compareWithBaseline", () => {
    it("should return all violations if baseline file does not exist", async () => {
      const violations = [{ file: "file.js", line: 10, rule: "no-console" }]
      fs.access.mockRejectedValueOnce(new Error("File not found"))

      const result = await baseline.compareWithBaseline(violations, "baseline.json")

      expect(result).toEqual(violations)
      expect(logger.logWarning).toHaveBeenCalledWith(expect.stringContaining("not found"))
    })

    it("should return all violations if baseline file is not valid JSON", async () => {
      const violations = [{ file: "file.js", line: 10, rule: "no-console" }]
      fs.access.mockResolvedValueOnce()
      fs.readFile.mockResolvedValueOnce("invalid json")

      const result = await baseline.compareWithBaseline(violations, "baseline.json")

      expect(result).toEqual(violations)
      expect(logger.logWarning).toHaveBeenCalledWith(expect.stringContaining("Failed to parse"))
    })

    it("should return all violations if baseline file does not contain an array", async () => {
      const violations = [{ file: "file.js", line: 10, rule: "no-console" }]
      fs.access.mockResolvedValueOnce()
      fs.readFile.mockResolvedValueOnce('{"notAnArray": true}')

      const result = await baseline.compareWithBaseline(violations, "baseline.json")

      expect(result).toEqual(violations)
      expect(logger.logWarning).toHaveBeenCalledWith(expect.stringContaining("does not contain an array"))
    })

    it("should filter out violations that are in the baseline", async () => {
      const violations = [
        { file: "file1.js", line: 10, rule: "no-console" },
        { file: "file2.js", line: 20, rule: "no-unused-vars" },
      ]

      const baselineViolations = [{ file: "file1.js", line: 10, rule: "no-console" }]

      fs.access.mockResolvedValueOnce()
      fs.readFile.mockResolvedValueOnce(JSON.stringify(baselineViolations))

      const result = await baseline.compareWithBaseline(violations, "baseline.json")

      expect(result).toHaveLength(1)
      expect(result[0].file).toBe("file2.js")
      expect(logger.logInfo).toHaveBeenCalledWith(expect.stringContaining("1 new violations"))
    })

    it("should handle errors during comparison", async () => {
      const violations = [{ file: "file.js", line: 10, rule: "no-console" }]
      fs.access.mockRejectedValueOnce(new Error("Unknown error"))

      const result = await baseline.compareWithBaseline(violations, "baseline.json")

      expect(result).toEqual(violations)
      expect(logger.logWarning).toHaveBeenCalled()
    })
  })
})
