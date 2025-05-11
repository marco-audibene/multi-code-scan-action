const core = require("@actions/core")
const github = require("@actions/github")
const { logSuccess, logWarning, logInfo, logError } = require("../utils/logger")

/**
 * Creates GitHub annotations for violations
 * @param {string} token - GitHub token
 * @param {Array} violations - Violations to report
 * @param {string} checkName - Name of the check run
 */
async function createAnnotations(token, violations, checkName) {
  logInfo(`Creating annotations for ${violations.length} violations`)

  // Create inline annotations using GitHub's workflow commands
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
      let message = `${violation.rule || "Unknown rule"}`

      // Add ruleset for PMD
      if (violation.engine === "pmd" && violation.ruleset) {
        message += ` (${violation.ruleset})`
      }

      message += `: ${violation.message || "No message provided"}`

      // Add documentation link if available
      if (violation.doc_url && violation.doc_url.trim() !== "") {
        message += `\nDocumentation: ${violation.doc_url}`
      }

      // Use GitHub's workflow commands to create annotations
      const file = violation.file
      const line = Number.parseInt(violation.line || violation.beginline || "1", 10) || 1
      const col = Number.parseInt(violation.column || violation.begincolumn || "1", 10) || 1

      // Use the appropriate command based on the annotation level
      if (annotationLevel === "error") {
        core.error(message, { file, line, col })
      } else if (annotationLevel === "warning") {
        core.warning(message, { file, line, col })
      } else {
        core.notice(message, { file, line, col })
      }
    } catch (error) {
      logWarning(`Failed to create annotation: ${error.message}`)
    }
  }

  await createCheckRun(token, violations, checkName)
}

/**
 * Creates a check run with summary information
 * @param {string} token - GitHub token
 * @param {Array} violations - Violations to report
 * @param {string} checkName - Name of the check run
 */
async function createCheckRun(token, violations, checkName) {
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
 * @param {Array} violations - All violations to report
 * @param {Array} newFileViolations - Violations in new files
 * @param {Array} modifiedFileViolations - Violations in modified files
 */
async function createPRComment(token, violations, newFileViolations, modifiedFileViolations) {
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

  // Add summary information
  commentBody += "### Summary\n\n"
  commentBody += `- Total violations: **${violations.length}**\n`
  commentBody += `- Violations in new files: **${newFileViolations.length}**\n`
  commentBody += `- Violations in modified files: **${modifiedFileViolations.length}**\n\n`

  // Add note about new files
  if (newFileViolations.length > 0) {
    commentBody += "⚠️ **Note:** New files must have zero violations to pass the quality check.\n\n"
  }

  // Add summary by file
  commentBody += "### Summary by File\n\n"
  commentBody += "| File | Violations | Status |\n"
  commentBody += "| ---- | ---------- | ------ |\n"

  Object.keys(violationsByFile).forEach((file) => {
    const count = violationsByFile[file].length

    // Determine if this is a new or modified file
    const isNewFile = newFileViolations.some((v) => v.file === file)
    const status = isNewFile ? "A" : "M"

    commentBody += `| ${file} | ${count} | ${status} |\n`
  })

  commentBody += "\n### Detailed Violations\n\n"

  // Add detailed tables for each file
  Object.keys(violationsByFile).forEach((file) => {
    // Determine if this is a new or modified file
    const isNewFile = newFileViolations.some((v) => v.file === file)
    const status = isNewFile ? "A" : "M"

    commentBody += `#### ${file} (${status})\n\n`
    commentBody += "| Line | Message | Rule | Severity | Documentation |\n"
    commentBody += "| ---- | ------- | ---- | -------- | ------------- |\n"

    // Sort by line number
    violationsByFile[file].sort((a, b) => Number.parseInt(a.line || "0") - Number.parseInt(b.line || "0"))

    violationsByFile[file].forEach((v) => {
      // Escape pipe characters in message
      const message = v.message ? v.message.replace(/\|/g, "\\|") : "No message provided"

      // Format rule info
      let ruleInfo = v.rule || "Unknown rule"
      if (v.engine === "pmd" && v.ruleset) {
        ruleInfo += ` (${v.ruleset})`
      }

      const docLink = v.doc_url && v.doc_url.trim() !== "" ? `[View](${v.doc_url})` : ""

      commentBody += `| ${v.line || "N/A"} | ${message} | ${ruleInfo} | ${v.severity || "medium"} | ${docLink} |\n`
    })

    commentBody += "\n"
  })

  // Add footer with explanation
  commentBody += "\n### Quality Check Rules\n\n"
  commentBody += "- **A (Added files)**: Must have zero violations to pass\n"
  commentBody += "- **M (Modified files)**: Limited tolerance for existing issues\n"
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

module.exports = {
  createAnnotations,
  createPRComment,
  createCheckRun,
}
