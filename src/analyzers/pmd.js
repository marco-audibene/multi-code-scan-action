const core = require("@actions/core")
const exec = require("@actions/exec")
const fs = require("fs").promises
const path = require("path")
const os = require("os")
const { logSuccess, logWarning, logInfo } = require("../utils/logger")
const formatter = require("../utils/formatter")

/**
 * Runs PMD on the specified files
 * @param {Object} fileType - File type configuration
 * @param {Array} filesToScan - Files to scan
 * @param {boolean} enableCache - Whether to enable caching
 * @returns {Array} Violations found
 */
async function runPMD(fileType, filesToScan, enableCache = false) {
  const name = fileType.name
  const nameKey = name.toLowerCase().replace(/\s+/g, "_")
  const sourcePath = fileType.sourcePath

  // Create file list
  const fileListPath = `${nameKey}-files-to-scan.txt`
  await formatter.createTempFile(fileListPath, filesToScan.join("\n"))

  // Create result file path - use a consistent name
  const resultPath = `pmd-result.json`

  // Log information about the scan - only log once
  logInfo(`Running pmd on ${filesToScan.length} ${name} files`)

  // Log ruleset information
  if (fileType.rulesPaths && fileType.rulesPaths.length > 0) {
    if (fileType.rulesPaths.length === 1) {
      logInfo(`Using ruleset: ${fileType.rulesPaths[0]}`)
    } else {
      logInfo(`Using rulesets:`)
      fileType.rulesPaths.forEach((rulePath) => {
        logInfo(`  - ${rulePath}`)
      })
    }
  } else {
    logInfo(`Using PMD default rulesets`)
  }

  // Build PMD command
  const pmdArgs = [
    "check",
    "--file-list",
    fileListPath,
    "--format",
    "json",
    "--no-progress",
    "--report-file",
    resultPath,
  ]

  // Add rulesets if specified
  if (fileType.rulesPaths && fileType.rulesPaths.length > 0) {
    pmdArgs.push("--rulesets", fileType.rulesPaths.join(","))
  }

  // Enable caching if requested
  let cacheLocation = ""
  if (enableCache) {
    // For PMD 7.0.0, the cache flag requires a location parameter
    cacheLocation = path.join(os.tmpdir(), ".pmd-cache", `${nameKey}-cache.bin`)
    pmdArgs.push("--cache", cacheLocation)
    logInfo(`pmd cache enabled at ${cacheLocation}`)
  }

  // Log analysis in progress
  logInfo(`Analysis in progress...`)

  // Run PMD
  const options = {
    ignoreReturnCode: true,
    silent: true, // Hide command output
  }

  let stdout = ""
  let stderr = ""

  try {
    // Capture stdout and stderr
    await exec.exec("pmd", pmdArgs, {
      ...options,
      listeners: {
        stdout: (data) => {
          stdout += data.toString()
        },
        stderr: (data) => {
          stderr += data.toString()
        },
      },
    })

    // Only log stdout/stderr in debug mode or if there's an error
    if (stderr) {
      logInfo(`PMD stderr: ${stderr}`)
    }
  } catch (error) {
    // PMD returns non-zero exit code when violations are found
    if (stderr) {
      logInfo(`PMD stderr: ${stderr}`)
    }
  }

  // Check if result file exists
  try {
    await fs.access(resultPath)
  } catch (error) {
    logWarning(`PMD did not generate a result file: ${error.message}`)

    // If we have stdout and it looks like JSON, try to parse it
    if (stdout && stdout.trim().startsWith("{")) {
      logInfo("Attempting to parse PMD output from stdout")
      try {
        const pmdResult = JSON.parse(stdout)
        return processPMDResult(pmdResult, name, sourcePath)
      } catch (parseError) {
        logWarning(`Failed to parse PMD output from stdout: ${parseError.message}`)
      }
    }

    return []
  }

  // Read and parse results
  const resultContent = await fs.readFile(resultPath, "utf8")

  let pmdResult
  try {
    pmdResult = JSON.parse(resultContent)
  } catch (error) {
    logWarning(`Failed to parse PMD results: ${error.message}`)
    return []
  }

  // Process violations
  const violations = processPMDResult(pmdResult, name, sourcePath)

  // Clean up
  await formatter.cleanupTempFiles([fileListPath, resultPath])

  return violations
}

/**
 * Process PMD result into standardized violations format
 * @param {Object} pmdResult - PMD result object
 * @param {string} name - File type name
 * @param {string} sourcePath - Source path from configuration
 * @returns {Array} Violations found
 */
function processPMDResult(pmdResult, name, sourcePath) {
  const violations = []

  if (pmdResult && pmdResult.files) {
    // Use the shared formatter to display violations by file
    formatter.displayViolationsByFile(
      pmdResult.files,
      (file) => file.violations || [],
      (file) => file.filename,
      (violation) => violation.beginline || "N/A",
      (violation) => violation.description || "No description provided",
      (violation) => violation.rule || "Unknown rule",
      (violation) => violation.externalInfoUrl || "",
      sourcePath,
    )

    // Process each file for the standardized format
    for (const file of pmdResult.files) {
      if (!file.filename) continue

      const normalizedFilePath = formatter.normalizeFilePath(file.filename, sourcePath)

      const fileViolations = file.violations || []
      for (const violation of fileViolations) {
        // Map priority to severity
        let severity = "info"
        if (violation.priority === 1) {
          severity = "critical"
        } else if (violation.priority === 2) {
          severity = "high"
        } else if (violation.priority === 3) {
          severity = "medium"
        } else if (violation.priority === 4) {
          severity = "low"
        }

        violations.push({
          engine: "pmd",
          ruleset: violation.ruleset,
          rule: violation.rule,
          severity: severity,
          message: violation.description,
          file: normalizedFilePath,
          line: violation.beginline,
          beginline: violation.beginline,
          endline: violation.endline || violation.beginline,
          begincolumn: violation.begincolumn,
          endcolumn: violation.endcolumn || violation.begincolumn,
          doc_url: violation.externalInfoUrl || "",
        })
      }
    }
  } else {
    logWarning("PMD result does not contain a 'files' property or is empty")
  }

  return violations
}

module.exports = {
  runPMD,
}
