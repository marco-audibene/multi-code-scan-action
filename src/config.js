const core = require("@actions/core")
const github = require("@actions/github")
const { logWarning } = require("./utils/logger")

/**
 * Loads and parses all configuration from GitHub Action inputs
 * @returns {Object} Configuration object with all parsed inputs
 */
function loadConfig() {
  try {
    // Get inputs
    const token = core.getInput("github-token")
    const sourcePath = core.getInput("sourcePath")
    const fileTypesConfig = JSON.parse(core.getInput("file-types-config"))
    const checkName = core.getInput("check-name")

    // Get new inputs
    const scanChangedFilesOnly = core.getInput("scanChangedFilesOnly") === "true"
    const enableScanCache = core.getInput("enableScanCache") === "true"
    const outputFormats = core
      .getInput("outputFormats")
      .split(",")
      .map((format) => format.trim())
    const maxCriticalViolations = Number.parseInt(core.getInput("maxCriticalViolations"), 10) || 0
    const maxMediumViolations = Number.parseInt(core.getInput("maxMediumViolations"), 10) || 10
    const previousViolationsFile = core.getInput("previousViolationsFile")
    const failOnQualityIssues = core.getInput("failOnQualityIssues") === "true"

    // Get new file-specific inputs
    const strictNewFiles = core.getInput("strictNewFiles") === "true"
    const maxViolationsForModifiedFiles = Number.parseInt(core.getInput("maxViolationsForModifiedFiles"), 10) || 10
    const maxCriticalViolationsForModifiedFiles =
      Number.parseInt(core.getInput("maxCriticalViolationsForModifiedFiles"), 10) || 0

    // Determine if we're in a pull request
    const isPullRequest =
      github.context.eventName === "pull_request" || github.context.eventName === "pull_request_target"

    // Create configuration object
    return {
      token,
      sourcePath,
      fileTypesConfig,
      checkName,
      scanChangedFilesOnly,
      enableScanCache,
      outputFormats,
      maxCriticalViolations,
      maxMediumViolations,
      previousViolationsFile,
      failOnQualityIssues,
      isPullRequest,
      strictNewFiles,
      maxViolationsForModifiedFiles,
      maxCriticalViolationsForModifiedFiles,
    }
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`)
  }
}

module.exports = {
  loadConfig,
}
