const core = require("@actions/core")
const { filterFilesByType } = require("../utils/files")
const { runPMD } = require("./pmd")
const { runESLint } = require("./eslint")
const { logSuccess, logWarning, logInfo, logSubsectionHeader, colors } = require("../utils/logger")

/**
 * Runs analysis on files based on file type configuration
 * @param {Array} fileTypesConfig - File types configuration
 * @param {Array} allFiles - All files to analyze
 * @param {boolean} enableCache - Whether to enable caching
 * @returns {Array} All violations found
 */
async function runAnalysis(fileTypesConfig, allFiles, enableCache = false) {
  let allViolations = []

  logInfo(`${colors.bright}Starting analysis of ${fileTypesConfig.length} file types`)

  for (const fileType of fileTypesConfig) {
    const name = fileType.name
    const analyzer = fileType.analyzer

    // Always create a subsection header for each file type
    logSubsectionHeader(`Analyzing ${name} files with ${analyzer}`)

    // Filter files for this file type
    const filesToScan = filterFilesByType(fileType, allFiles)

    if (filesToScan.length === 0) {
      // Use green success message when no files are found
      logSuccess(`No ${name} files to scan`)
      continue
    }

    // Run appropriate analyzer
    let violations = []
    try {
      if (analyzer === "pmd") {
        violations = await runPMD(fileType, filesToScan, enableCache)
      } else if (analyzer === "eslint") {
        violations = await runESLint(fileType, filesToScan, enableCache)
      } else {
        logWarning(`Unknown analyzer: ${analyzer}`)
        continue
      }

      // Remove redundant message - the analyzer will handle reporting violations
      if (violations.length === 0) {
        logSuccess(`No violations found in ${name} files`)
      }
    } catch (error) {
      logWarning(`Error running ${analyzer} on ${name} files: ${error.message}`)
    }

    allViolations = allViolations.concat(violations)
  }

  // Show a summary of all violations at the end
  if (allViolations.length > 0) {
    // Group violations by severity for the summary
    const severityCounts = {
      critical: allViolations.filter((v) => v.severity === "critical").length,
      high: allViolations.filter((v) => v.severity === "high").length,
      medium: allViolations.filter((v) => v.severity === "medium").length,
      low: allViolations.filter((v) => v.severity === "low").length,
      info: allViolations.filter((v) => v.severity === "info").length,
    }

    core.info("")
    logInfo(`${colors.bright}Summary of all violations:${colors.reset}`)
    if (severityCounts.critical > 0) logWarning(`Critical: ${severityCounts.critical}`)
    if (severityCounts.high > 0) logWarning(`High: ${severityCounts.high}`)
    if (severityCounts.medium > 0) logInfo(`Medium: ${severityCounts.medium}`)
    if (severityCounts.low > 0) logInfo(`Low: ${severityCounts.low}`)
    if (severityCounts.info > 0) logInfo(`Info: ${severityCounts.info}`)
  } else {
    logSuccess(`${colors.bright}No violations found across all file types`)
  }

  return allViolations
}

module.exports = {
  runAnalysis,
}
