const core = require("@actions/core")
const exec = require("@actions/exec")
const fs = require("fs").promises
const path = require("path")
const os = require("os")
const { logWarning, logInfo } = require("../utils/logger")
const formatter = require("../utils/formatter")

/**
 * Runs ESLint on the specified files
 * @param {Object} fileType - File type configuration
 * @param {Array} filesToScan - Files to scan
 * @param {boolean} enableCache - Whether to enable caching
 * @returns {Array} Violations found
 */
async function runESLint(fileType, filesToScan, enableCache = false) {
  const name = fileType.name
  const nameKey = name.toLowerCase().replace(/\s+/g, "_")
  const sourcePath = fileType.sourcePath

  // Log information about the scan - only log once
  logInfo(`Running eslint on ${filesToScan.length} ${name} files`)

  // Determine which config file to use
  let configPath
  if (fileType.rulesPaths && fileType.rulesPaths.length > 0) {
    if (fileType.rulesPaths.length === 1) {
      configPath = fileType.rulesPaths[0]
      logInfo(`Using ruleset: ${configPath}`)
    } else {
      logInfo(`Using rulesets:`)
      fileType.rulesPaths.forEach((rulePath) => {
        logInfo(`  - ${rulePath}`)
      })
      configPath = fileType.rulesPaths[0] // Use the first one as the config
    }
  } else {
    // Use standard config based on file type
    const installSalesforcePlugins = core.getInput("installSalesforcePlugins") === "true"

    if (installSalesforcePlugins) {
      if (name.toLowerCase().includes("lwc")) {
        configPath = "standard-lwc-config.json"
      } else if (name.toLowerCase().includes("aura")) {
        configPath = "standard-aura-config.json"
      } else {
        // For other JavaScript, use the generic config
        configPath = "standard-js-config.json"
      }
    } else {
      // For generic projects, use the standard JS config
      configPath = "standard-js-config.json"
    }

    logInfo(`Using standard configuration: ${configPath || "ESLint defaults"}`)
  }

  const violations = []

  // Create a temporary file list for ESLint
  const fileListPath = `${nameKey}-eslint-files.txt`
  await formatter.createTempFile(fileListPath, filesToScan.join("\n"))

  // Create a temporary results file
  const resultPath = `${nameKey}-eslint-results.json`

  // Build ESLint command
  const eslintArgs = [
    "eslint",
    "--ext",
    ".js,.jsx,.ts,.tsx,.html,.css,.cmp,.app,.intf,.evt,.design",
    "--format",
    "json",
    "--output-file",
    resultPath,
    "--no-error-on-unmatched-pattern",
  ]

  // Add config if specified
  if (configPath) {
    eslintArgs.push("--config", configPath, "--no-eslintrc")
  }

  // Enable caching if requested
  let cacheLocation = ""
  if (enableCache) {
    cacheLocation = path.join(os.tmpdir(), ".eslint-cache", `${nameKey}-cache`)
    eslintArgs.push("--cache", "--cache-location", cacheLocation)
    logInfo(`eslint cache enabled at ${cacheLocation}`)
  }

  // Log analysis in progress
  logInfo(`Analysis in progress...`)

  // Add files to scan
  eslintArgs.push(...filesToScan)

  // let stdout = ""
  let stderr = ""

  // Run ESLint
  const options = {
    ignoreReturnCode: true,
    silent: true, // Hide command output
    listeners: {
      stdout: () => {
        // We're not using stdout data
      },
      stderr: (data) => {
        stderr += data.toString()
      },
    },
  }

  try {
    await exec.exec("npx", eslintArgs, options)

    // Only log stderr if there's an error
    if (stderr) {
      logInfo(`ESLint stderr: ${stderr}`)
    }
  } catch (error) {
    if (stderr) {
      logInfo(`ESLint stderr: ${stderr}`)
    }
  }

  // Check if result file exists and has content
  try {
    const stats = await fs.stat(resultPath)
    if (stats.size === 0) {
      logInfo(`No ESLint output for ${name}`)
      await fs.writeFile(resultPath, "[]")
    }
  } catch (error) {
    logWarning(`ESLint did not generate a result file: ${error.message}`)
    await formatter.createTempFile(resultPath, "[]")
    return violations
  }

  // Read and parse results
  const resultContent = await fs.readFile(resultPath, "utf8")
  let eslintResult
  try {
    eslintResult = JSON.parse(resultContent)
  } catch (error) {
    logWarning(`Failed to parse ESLint results: ${error.message}`)
    eslintResult = []
  }

  // Process violations
  if (Array.isArray(eslintResult)) {
    // Filter out files with no violations
    const filesWithViolations = eslintResult.filter((file) => file.messages && file.messages.length > 0)

    // Use the shared formatter to display violations by file
    formatter.displayViolationsByFile(
      filesWithViolations,
      (file) => file.messages || [],
      (file) => file.filePath,
      (message) => message.line || "N/A",
      (message) => message.message || "No message provided",
      (message) => message.ruleId || "unknown",
      (message) => {
        // For ESLint, provide documentation URLs
        let docUrl = ""
        if (message.ruleId && !message.ruleId.includes("/") && message.ruleId !== "unknown") {
          docUrl = `https://eslint.org/docs/latest/rules/${message.ruleId}`
        } else if (message.ruleId && message.ruleId.startsWith("@lwc/lwc/")) {
          const ruleName = message.ruleId.replace("@lwc/lwc/", "")
          docUrl = `https://github.com/salesforce/eslint-plugin-lwc/tree/master/docs/rules/${ruleName}.md`
        } else if (message.ruleId && message.ruleId.startsWith("@salesforce/aura/")) {
          const ruleName = message.ruleId.replace("@salesforce/aura/", "")
          docUrl = `https://github.com/forcedotcom/eslint-plugin-aura/tree/master/docs/rules/${ruleName}.md`
        }
        return docUrl
      },
      sourcePath,
    )

    // Process each file for the standardized format
    for (const fileResult of filesWithViolations) {
      if (fileResult.messages && fileResult.messages.length > 0) {
        const filePath = formatter.normalizeFilePath(fileResult.filePath, sourcePath)

        // Process each message for the standardized format
        for (const message of fileResult.messages) {
          // Map ESLint severity to our severity levels
          let severity = "info"
          if (message.severity === 2) {
            severity = "high"
          } else if (message.severity === 1) {
            severity = "medium"
          }

          // For ESLint, provide documentation URLs
          let docUrl = ""
          if (message.ruleId && !message.ruleId.includes("/") && message.ruleId !== "unknown") {
            docUrl = `https://eslint.org/docs/latest/rules/${message.ruleId}`
          } else if (message.ruleId && message.ruleId.startsWith("@lwc/lwc/")) {
            const ruleName = message.ruleId.replace("@lwc/lwc/", "")
            docUrl = `https://github.com/salesforce/eslint-plugin-lwc/tree/master/docs/rules/${ruleName}.md`
          } else if (message.ruleId && message.ruleId.startsWith("@salesforce/aura/")) {
            const ruleName = message.ruleId.replace("@salesforce/aura/", "")
            docUrl = `https://github.com/forcedotcom/eslint-plugin-aura/tree/master/docs/rules/${ruleName}.md`
          }

          violations.push({
            engine: "eslint",
            rule: message.ruleId || "unknown",
            severity: severity,
            message: message.message || "",
            file: filePath,
            line: message.line || 1,
            column: message.column || 1,
            endline: message.endLine || message.line || 1,
            endcolumn: message.endColumn || message.column || 1,
            doc_url: docUrl,
          })
        }
      }
    }
  } else {
    logWarning(`ESLint result is not an array: ${typeof eslintResult}`)
  }

  // Clean up
  await formatter.cleanupTempFiles([fileListPath, resultPath])

  return violations
}

module.exports = {
  runESLint,
}
