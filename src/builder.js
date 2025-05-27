const fs = require("fs").promises
const path = require("path")
const { getChangedFiles, getAllFiles } = require("./utils/files")
const { runAnalysis } = require("./analyzers/analyzer")
const { compareWithBaseline } = require("./utils/baseline")
const {
  logSectionHeader,
  logSubsectionHeader,
  logSuccess,
  logWarning,
  logInfo,
  logError,
  setOutput,
  setFailed,
} = require("./utils/logger")

/**
 * Initializes the code quality scan process
 * @param {Object} config - Configuration object with all inputs
 * @returns {Object} - Initialized configuration and files to scan
 */
async function initializeScan(config) {
  logSectionHeader("Salesforce Code Quality Scan")

  logSubsectionHeader("Configuration")
  logInfo(`Source Path: ${config.sourcePath}`)
  logInfo(`Scan changed files only: ${config.scanChangedFilesOnly ? "Yes" : "No"}`)
  logInfo(`Enable scan cache: ${config.enableScanCache ? "Yes" : "No"}`)
  logInfo(`Output formats: ${config.outputFormats.join(", ")}`)
  logInfo(`Max critical violations: ${config.maxCriticalViolations}`)
  logInfo(`Max medium violations: ${config.maxMediumViolations}`)
  logInfo(`Previous violations file: ${config.previousViolationsFile || "None"}`)
  logInfo(`Fail on quality issues: ${config.failOnQualityIssues ? "Yes" : "No"}`)
  logInfo(`Strict rules for new files: ${config.strictNewFiles ? "Yes" : "No"}`)
  logInfo(`Max violations for modified files: ${config.maxViolationsForModifiedFiles}`)
  logInfo(`Max critical violations for modified files: ${config.maxCriticalViolationsForModifiedFiles}`)

  // Determine which files to scan - changed to use subsection header
  logSubsectionHeader("Collecting Files to Scan")
  let filesResult = {}

  if (config.isPullRequest && config.scanChangedFilesOnly) {
    logInfo("Getting changed files in PR...")
    filesResult = await getChangedFiles(config.token, config.sourcePath)
    logInfo(`Found ${filesResult.totalFiles} total changed files in PR`)
    logInfo(`Found ${filesResult.newFiles.length} new files in PR matching sourcePath: ${config.sourcePath}`)
    logInfo(`Found ${filesResult.modifiedFiles.length} modified files in PR matching sourcePath: ${config.sourcePath}`)
    logSuccess(`Found ${filesResult.filteredFiles.length} total files in PR matching sourcePath: ${config.sourcePath}`)
  } else {
    logInfo("Getting all files in repository...")
    filesResult = await getAllFiles(config.sourcePath)
    logInfo(`Found ${filesResult.totalFiles} total files in repository`)
    logSuccess(
      `Found ${filesResult.filteredFiles.length} files in repository matching sourcePath: ${config.sourcePath}`,
    )
  }

  return {
    ...config,
    filesToScan: filesResult.filteredFiles,
    newFiles: filesResult.newFiles,
    modifiedFiles: filesResult.modifiedFiles,
  }
}

/**
 * Runs the code quality scan
 * @param {Object} config - Configuration object with all inputs and files to scan
 * @returns {Object} - Object containing all violations and violations by file type
 */
async function runScan(config) {
  // Run analysis on files - changed to use section header
  logSectionHeader("Running Code Analysis")
  const violations = await runAnalysis(config.fileTypesConfig, config.filesToScan, config.enableScanCache)

  // Compare with baseline if provided
  let reportableViolations = violations
  if (config.previousViolationsFile) {
    logSubsectionHeader(`Comparing with baseline from ${config.previousViolationsFile}`)
    reportableViolations = await compareWithBaseline(violations, config.previousViolationsFile)
    logSuccess(`Found ${reportableViolations.length} new or changed violations`)
  }

  // Separate violations for new and modified files
  const newFileViolations = reportableViolations.filter((violation) =>
    config.newFiles.some((file) => violation.file === file || violation.file.endsWith(file)),
  )

  const modifiedFileViolations = reportableViolations.filter((violation) =>
    config.modifiedFiles.some((file) => violation.file === file || violation.file.endsWith(file)),
  )

  return {
    allViolations: reportableViolations,
    newFileViolations,
    modifiedFileViolations,
  }
}

/**
 * Creates output directory for reports
 * @returns {string} - Path to output directory
 */
async function createOutputDirectory() {
  const outputDir = "code-quality-reports"

  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(outputDir, { recursive: true })
    return outputDir
  } catch (error) {
    logWarning(`Failed to create output directory: ${error.message}`)
    return "."
  }
}

/**
 * Evaluates results against thresholds
 * @param {Object} violationsObj - Object containing all violations and violations by file type
 * @param {Object} config - Configuration object with thresholds
 * @returns {Object} - Results summary
 */
function evaluateResults(violationsObj, config) {
  const { allViolations, newFileViolations, modifiedFileViolations } = violationsObj

  // Count violations by severity
  const criticalViolations = allViolations.filter((v) => v.severity === "critical" || v.severity === "high").length
  const mediumViolations = allViolations.filter((v) => v.severity === "medium").length

  // Count violations in new files by severity
  const newFileCriticalViolations = newFileViolations.filter(
    (v) => v.severity === "critical" || v.severity === "high",
  ).length

  // Count violations in modified files by severity
  const modifiedFileCriticalViolations = modifiedFileViolations.filter(
    (v) => v.severity === "critical" || v.severity === "high",
  ).length

  logSectionHeader("Results Summary")
  logInfo(`Total violations: ${allViolations.length}`)
  logInfo(`Critical/high violations: ${criticalViolations}`)
  logInfo(`Medium violations: ${mediumViolations}`)
  logInfo(`Low/info violations: ${allViolations.length - criticalViolations - mediumViolations}`)
  logInfo(`\nNew file violations: ${newFileViolations.length}`)
  logInfo(`New file critical/high violations: ${newFileCriticalViolations}`)
  logInfo(`\nModified file violations: ${modifiedFileViolations.length}`)
  logInfo(`Modified file critical/high violations: ${modifiedFileCriticalViolations}`)

  // Set output variables
  setOutput("total-violations", allViolations.length)
  setOutput("critical-violations", criticalViolations)
  setOutput("medium-violations", mediumViolations)
  setOutput("new-file-violations", newFileViolations.length)
  setOutput("modified-file-violations", modifiedFileViolations.length)

  // Determine if action should fail based on thresholds
  let shouldFail = false
  const failureReasons = []

  // Check if new files have any violations (strict mode)
  if (config.strictNewFiles && newFileViolations.length > 0) {
    shouldFail = true
    failureReasons.push(`New files have ${newFileViolations.length} violations (strict mode requires 0)`)
  }

  // Check modified files against their specific thresholds
  if (modifiedFileCriticalViolations > config.maxCriticalViolationsForModifiedFiles) {
    shouldFail = true
    failureReasons.push(
      `Modified files have ${modifiedFileCriticalViolations} critical/high violations ` +
        `(threshold: ${config.maxCriticalViolationsForModifiedFiles})`,
    )
  }

  if (modifiedFileViolations.length > config.maxViolationsForModifiedFiles) {
    shouldFail = true
    failureReasons.push(
      `Modified files have ${modifiedFileViolations.length} total violations ` +
        `(threshold: ${config.maxViolationsForModifiedFiles})`,
    )
  }

  // Check overall thresholds as a fallback
  if (config.failOnQualityIssues && !shouldFail) {
    if (criticalViolations > config.maxCriticalViolations) {
      shouldFail = true
      failureReasons.push(
        `Overall critical/high violations: ${criticalViolations} ` + `(threshold: ${config.maxCriticalViolations})`,
      )
    }

    if (mediumViolations > config.maxMediumViolations) {
      shouldFail = true
      failureReasons.push(
        `Overall medium violations: ${mediumViolations} ` + `(threshold: ${config.maxMediumViolations})`,
      )
    }
  }

  // Set the action required flag
  setOutput("action-required", shouldFail)

  // Set violations as JSON output
  try {
    // Convert violations to JSON string
    const violationsJson = JSON.stringify(allViolations)
    setOutput("violations", violationsJson)
    logInfo("Violations data set as output")
  } catch (error) {
    logWarning(`Failed to set violations as output: ${error.message}`)
  }

  if (shouldFail && config.failOnQualityIssues) {
    const errorMessage = `Quality issues found:\n${failureReasons.join("\n")}`
    logError(errorMessage)
    setFailed(errorMessage)
  } else if (allViolations.length > 0) {
    logWarning(`Found ${allViolations.length} code quality violations.`)
  } else {
    logSuccess("No violations found. Great job!")
  }

  return {
    totalViolations: allViolations.length,
    criticalViolations,
    mediumViolations,
    lowViolations: allViolations.length - criticalViolations - mediumViolations,
    newFileViolations: newFileViolations.length,
    modifiedFileViolations: modifiedFileViolations.length,
    shouldFail,
    failureReasons,
  }
}

module.exports = {
  initializeScan,
  runScan,
  createOutputDirectory,
  evaluateResults,
}
