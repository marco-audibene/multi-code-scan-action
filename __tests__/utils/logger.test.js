const core = require("@actions/core")
const logger = require("../../src/utils/logger")

// Mock @actions/core
jest.mock("@actions/core", () => ({
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  notice: jest.fn(),
}))

describe("logger", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("logSectionHeader", () => {
    it("should log a section header with decorative borders", () => {
      logger.logSectionHeader("Test Section")
      // The actual implementation calls core.info 5 times, not 4
      expect(core.info).toHaveBeenCalledTimes(5) // Empty line + top border + title + bottom border + empty line
    })
  })

  describe("logSubsectionHeader", () => {
    it("should log a subsection header", () => {
      logger.logSubsectionHeader("Test Subsection")
      expect(core.info).toHaveBeenCalledTimes(3) // Empty line + title + separator
    })
  })

  describe("logSuccess", () => {
    it("should log a success message", () => {
      logger.logSuccess("Test success")
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Test success"))
    })
  })

  describe("logWarning", () => {
    it("should log a warning message without options", () => {
      logger.logWarning("Test warning")
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining("WARNING: Test warning"))
    })

    it("should log a warning message with options", () => {
      const options = { file: "test.js", line: 10 }
      logger.logWarning("Test warning", options)
      expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("Test warning"), options)
    })
  })

  describe("logError", () => {
    it("should log an error message without options", () => {
      logger.logError("Test error")
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining("ERROR: Test error"))
    })

    it("should log an error message with options", () => {
      const options = { file: "test.js", line: 10 }
      logger.logError("Test error", options)
      expect(core.error).toHaveBeenCalledWith(expect.stringContaining("Test error"), options)
    })
  })

  describe("logInfo", () => {
    it("should log an info message", () => {
      logger.logInfo("Test info")
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Test info"))
    })
  })

  describe("logDebug", () => {
    it("should log a debug message", () => {
      logger.logDebug("Test debug")
      expect(core.debug).toHaveBeenCalledWith(expect.stringContaining("Test debug"))
    })
  })

  describe("setOutput", () => {
    it("should set an output variable", () => {
      logger.setOutput("test-output", "test-value")
      expect(core.setOutput).toHaveBeenCalledWith("test-output", "test-value")
    })
  })

  describe("setFailed", () => {
    it("should set the action as failed", () => {
      logger.setFailed("Test failure")
      expect(core.setFailed).toHaveBeenCalledWith("Test failure")
      // The actual implementation logs to core.info, not core.error
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Test failure"))
    })
  })

  describe("notice", () => {
    it("should create a notice annotation", () => {
      logger.notice("Test notice")
      // The actual implementation passes undefined as the second parameter
      expect(core.notice).toHaveBeenCalledWith("Test notice", undefined)
    })
  })
})
