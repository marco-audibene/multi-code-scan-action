const { execSync } = require("child_process")
const installer = require("./utils/installer")
const { loadConfig } = require("./config")
const { initializeScan, runScan, createOutputDirectory, evaluateResults } = require("./builder")
const { createAnnotations, createPRComment } = require("./reporters/annotator")
const { generateReports } = require("./reporters/reporter")
const { logSectionHeader, logInfo, logError, setFailed } = require("./utils/logger")
const formatter = require("./utils/formatter")

/**
 * Detects the project root path
 * @returns {string} The detected project root path
 */
function detectProjectRoot() {
  try {
    // Try to get the git root directory
    const gitRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim()
    return gitRoot
  } catch (error) {
    // If git command fails, use the current working directory
    return process.cwd()
  }
}

async function run() {
  try {
    // Detect and set project root path for file normalization
    const projectRoot = detectProjectRoot()
    formatter.setProjectRootPath(projectRoot)
    logInfo(`Project root detected at: ${projectRoot}`)

    // Load configuration from inputs
    const config = loadConfig()

    // Install required tools (PMD, ESLint)
    logSectionHeader("Installing Required Tools")
    await installer.installTools()

    // Initialize scan and get files to scan
    const scanConfig = await initializeScan(config)

    // Run the scan
    const violationsObj = await runScan(scanConfig)

    // Create output directory for reports
    const outputDir = await createOutputDirectory()

    // Generate reports in requested formats
    logSectionHeader("Generating Reports")
    logInfo(`Formats: ${config.outputFormats.join(", ")}`)
    await generateReports(violationsObj.allViolations, config.outputFormats, outputDir)

    // Create annotations and PR comment if GitHub format is requested
    if (config.outputFormats.includes("github")) {
      if (violationsObj.allViolations.length > 0) {
        logInfo(`Creating GitHub annotations for ${violationsObj.allViolations.length} violations...`)
        await createAnnotations(config.token, violationsObj.allViolations, config.checkName)

        if (config.isPullRequest) {
          logInfo("Creating PR comment with violations summary...")
          await createPRComment(
            config.token,
            violationsObj.allViolations,
            violationsObj.newFileViolations,
            violationsObj.modifiedFileViolations,
            config.checkName, // Pass the check name to the PR comment
          )
        }
      }
    }

    // Evaluate results against thresholds
    evaluateResults(violationsObj, scanConfig)

    logSectionHeader("Scan Completed")
  } catch (error) {
    logError(`Action failed with error: ${error.message}`)
    setFailed(`Action failed with error: ${error.message}`)
    if (error.stack) {
      logInfo(`Stack trace: ${error.stack}`)
    }
  }
}

run()
