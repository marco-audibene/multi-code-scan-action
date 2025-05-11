const github = require("@actions/github")
const fs = require("fs").promises
const path = require("path")
const { logSuccess, logWarning, logInfo, logError, setOutput, notice } = require("../utils/logger")

/**
 * Creates GitHub annotations for violations
 * @param {string} token - GitHub token
 * @param {Array} violations - Violations to report
 * @param {string} checkName - Name of the check run
 */
async function createAnnotations(token, violations, checkName) {
  logInfo(`Creating annotations for ${violations.length} violations`)

  // In a composite action, we need to use a different approach for annotations
  // Instead of using the checks API directly, we'll use GitHub's workflow commands
  // This is how the "spaghetti" workflow likely creates annotations

  for (const violation of violations) {
    try {
      // Map severity to GitHub annotation level
      let annotationLevel = "warning"
      if (violation.severity === "critical" || violation.severity === "high") {
        annotationLevel = "error"
      } else if (violation.severity === "info") {
        annotationLevel = "notice"
      }

      // Format the message with documentation URL if available
      let message = `${violation.rule || "Unknown rule"} (${violation.category || "unknown"}): ${violation.message || "No message provided"}`

      // Add documentation link if available
      if (violation.doc_url && violation.doc_url.trim() !== "") {
        message += `\nDocumentation: ${violation.doc_url}`
      }

      // Use GitHub's workflow commands to create annotations
      // See: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message
      const file = violation.file
      const line = Number.parseInt(violation.line || violation.beginline || "1", 10) || 1
      const col = Number.parseInt(violation.column || violation.begincolumn || "1", 10) || 1
      const options = { file, line, col }

      // Use the appropriate command based on the annotation level
      if (annotationLevel === "error") {
        logError(message, options)
      } else if (annotationLevel === "warning") {
        logWarning(message, options)
      } else {
        notice(message, options)
      }
    } catch (error) {
      logWarning(`Failed to create annotation: ${error.message}`)
    }
  }

  // Still create a check run for the summary, but without annotations
  try {
    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    // Get the appropriate SHA based on the event type
    let headSha
    if (github.context.eventName === "pull_request" || github.context.eventName === "pull_request_target") {
      headSha = github.context.payload.pull_request.head.sha
    } else {
      headSha = github.context.sha
    }

    await octokit.rest.checks.create({
      owner,
      repo,
      name: checkName,
      head_sha: headSha,
      status: "completed",
      conclusion: violations.length > 0 ? "failure" : "success",
      output: {
        title:
          violations.length > 0
            ? `Code Quality Issues Found (${violations.length} violations)`
            : "No Code Quality Issues Found",
        summary:
          violations.length > 0
            ? `Found ${violations.length} code quality violations that need to be fixed.`
            : "No code quality violations found. Great job!",
      },
    })

    logSuccess(`Successfully created check run summary`)
  } catch (error) {
    logError(`Failed to create check run: ${error.message}`)
    if (error.response) {
      logError(`Response status: ${error.response.status}`)
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`)
    }
  }
}

/**
 * Creates a PR comment with violations summary
 * @param {string} token - GitHub token
 * @param {Array} violations - Violations to report
 */
async function createPRComment(token, violations) {
  logInfo(`Creating PR comment for ${violations.length} violations`)

  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo
  const prNumber = github.context.payload.pull_request.number

  // Group violations by file
  const violationsByFile = {}
  violations.forEach((v) => {
    if (!violationsByFile[v.file]) {
      violationsByFile[v.file] = []
    }
    violationsByFile[v.file].push(v)
  })

  // Create markdown table
  let commentBody = "## Code Quality Violations\n\n"
  commentBody += "The following code quality violations were found in this PR:\n\n"

  // Add summary by file
  commentBody += "### Summary by File\n\n"
  commentBody += "| File | Violations |\n"
  commentBody += "| ---- | ---------- |\n"

  Object.keys(violationsByFile).forEach((file) => {
    const count = violationsByFile[file].length
    commentBody += `| ${file} | ${count} |\n`
  })

  commentBody += "\n### Detailed Violations\n\n"

  // Add detailed tables for each file
  Object.keys(violationsByFile).forEach((file) => {
    commentBody += `#### ${file}\n\n`
    commentBody += "| Line | Message | Rule Info | Documentation |\n"
    commentBody += "| ---- | ------- | --------- | ------------- |\n"

    // Sort by line number
    violationsByFile[file].sort((a, b) => Number.parseInt(a.line || "0") - Number.parseInt(b.line || "0"))

    violationsByFile[file].forEach((v) => {
      // Escape pipe characters in message
      const message = v.message ? v.message.replace(/\|/g, "\\|") : "No message provided"
      const ruleInfo = `${v.rule || "Unknown rule"} (Priority: ${v.severity || "medium"}, Ruleset: ${v.category || "unknown"})`
      const docLink = v.doc_url && v.doc_url.trim() !== "" ? `[View](${v.doc_url})` : ""

      commentBody += `| ${v.line || "N/A"} | ${message} | ${ruleInfo} | ${docLink} |\n`
    })

    commentBody += "\n"
  })

  // Add footer
  commentBody += "\nPlease fix these issues before merging this PR."

  try {
    // Post comment to PR
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: commentBody,
    })

    logSuccess(`Posted violations summary comment to PR #${prNumber}`)
  } catch (error) {
    logError(`Failed to create PR comment: ${error.message}`)
    if (error.response) {
      logError(`Response status: ${error.response.status}`)
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`)
    }
  }
}

/**
 * Generates reports in various formats
 * @param {Array} violations - Violations to report
 * @param {Array} formats - Output formats to generate
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} - Paths to generated reports
 */
async function generateReports(violations, formats, outputDir) {
  const reportPaths = {}

  // Generate reports in each requested format
  for (const format of formats) {
    if (format === "github") {
      // GitHub annotations are handled separately
      continue
    }

    try {
      if (format === "json") {
        const jsonPath = await generateJsonReport(violations, outputDir)
        reportPaths.json = jsonPath
      } else if (format === "html") {
        const htmlPath = await generateHtmlReport(violations, outputDir)
        reportPaths.html = htmlPath
      } else if (format === "text") {
        const textPath = await generateTextReport(violations, outputDir)
        reportPaths.text = textPath
      } else {
        logWarning(`Unsupported output format: ${format}`)
      }
    } catch (error) {
      logWarning(`Failed to generate ${format} report: ${error.message}`)
    }
  }

  return reportPaths
}

/**
 * Generates a JSON report
 * @param {Array} violations - Violations to report
 * @param {string} outputDir - Output directory
 * @returns {string} - Path to the generated report
 */
async function generateJsonReport(violations, outputDir) {
  const outputPath = path.join(outputDir, "violations.json")
  await fs.writeFile(outputPath, JSON.stringify(violations, null, 2))
  logSuccess(`Generated JSON report at ${outputPath}`)

  // Set output path as an artifact
  setOutput("json-report-path", outputPath)
  return outputPath
}

/**
 * Generates an HTML report
 * @param {Array} violations - Violations to report
 * @param {string} outputDir - Output directory
 * @returns {string} - Path to the generated report
 */
async function generateHtmlReport(violations, outputDir) {
  const outputPath = path.join(outputDir, "violations.html")

  // Group violations by file
  const violationsByFile = {}
  violations.forEach((v) => {
    if (!violationsByFile[v.file]) {
      violationsByFile[v.file] = []
    }
    violationsByFile[v.file].push(v)
  })

  // Generate HTML content
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Quality Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1 { color: #333; }
    .summary { margin-bottom: 20px; }
    .file-section { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 5px; padding: 15px; }
    .file-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; border-bottom: 1px solid #ddd; border-radius: 5px 5px 0 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .critical { background-color: #ffdddd; }
    .high { background-color: #ffeeee; }
    .medium { background-color: #ffffdd; }
    .low { background-color: #eeffee; }
    .info { background-color: #e6f7ff; }
  </style>
</head>
<body>
  <h1>Code Quality Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total violations: ${violations.length}</p>
    <p>Files with violations: ${Object.keys(violationsByFile).length}</p>
  </div>
  
  <h2>Violations by File</h2>
  `

  // Add file sections
  Object.keys(violationsByFile).forEach((file) => {
    const fileViolations = violationsByFile[file]

    html += `
  <div class="file-section">
    <div class="file-header">
      <h3>${file}</h3>
      <p>Violations: ${fileViolations.length}</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Line</th>
          <th>Rule</th>
          <th>Severity</th>
          <th>Message</th>
          <th>Documentation</th>
        </tr>
      </thead>
      <tbody>
    `

    // Sort by line number
    fileViolations.sort((a, b) => Number.parseInt(a.line || "0") - Number.parseInt(b.line || "0"))

    fileViolations.forEach((v) => {
      const docLink = v.doc_url && v.doc_url.trim() !== "" ? `<a href="${v.doc_url}" target="_blank">View</a>` : ""

      html += `
        <tr class="${v.severity}">
          <td>${v.line || "N/A"}</td>
          <td>${v.rule || "Unknown"}</td>
          <td>${v.severity || "medium"}</td>
          <td>${v.message || "No message provided"}</td>
          <td>${docLink}</td>
        </tr>
      `
    })

    html += `
      </tbody>
    </table>
  </div>
    `
  })

  html += `
</body>
</html>
  `

  await fs.writeFile(outputPath, html)
  logSuccess(`Generated HTML report at ${outputPath}`)

  // Set output path as an artifact
  setOutput("html-report-path", outputPath)
  return outputPath
}

/**
 * Generates a text report
 * @param {Array} violations - Violations to report
 * @param {string} outputDir - Output directory
 * @returns {string} - Path to the generated report
 */
async function generateTextReport(violations, outputDir) {
  const outputPath = path.join(outputDir, "violations.txt")

  // Group violations by file
  const violationsByFile = {}
  violations.forEach((v) => {
    if (!violationsByFile[v.file]) {
      violationsByFile[v.file] = []
    }
    violationsByFile[v.file].push(v)
  })

  // Generate text content
  let text = "Code Quality Report\n"
  text += "===================\n\n"

  text += `Total violations: ${violations.length}\n`
  text += `Files with violations: ${Object.keys(violationsByFile).length}\n\n`

  text += "Violations by File\n"
  text += "-----------------\n\n"

  Object.keys(violationsByFile).forEach((file) => {
    const fileViolations = violationsByFile[file]

    text += `File: ${file}\n`
    text += `Violations: ${fileViolations.length}\n\n`

    // Sort by line number
    fileViolations.sort((a, b) => Number.parseInt(a.line || "0") - Number.parseInt(b.line || "0"))

    fileViolations.forEach((v) => {
      text += `Line ${v.line || "N/A"}: [${v.severity || "medium"}] ${v.rule || "Unknown"}\n`
      text += `  ${v.message || "No message provided"}\n`
      if (v.doc_url && v.doc_url.trim() !== "") {
        text += `  Documentation: ${v.doc_url}\n`
      }
      text += "\n"
    })

    text += "\n"
  })

  await fs.writeFile(outputPath, text)
  logSuccess(`Generated text report at ${outputPath}`)

  // Set output path as an artifact
  setOutput("text-report-path", outputPath)
  return outputPath
}

module.exports = {
  createAnnotations,
  createPRComment,
  generateReports,
  generateJsonReport,
  generateHtmlReport,
  generateTextReport,
}
