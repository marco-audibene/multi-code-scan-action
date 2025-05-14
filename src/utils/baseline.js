const fs = require("fs").promises
const { logInfo, logWarning } = require("./logger")

/**
 * Compares current violations with a baseline to find new or changed violations
 * @param {Array} currentViolations - Current violations found
 * @param {string} baselineFilePath - Path to the baseline violations file
 * @returns {Array} New or changed violations
 */
async function compareWithBaseline(currentViolations, baselineFilePath) {
  try {
    // Check if baseline file exists
    try {
      await fs.access(baselineFilePath)
    } catch (error) {
      logWarning(`Baseline file not found at ${baselineFilePath}. All violations will be reported.`)
      return currentViolations
    }

    // Read baseline file
    const baselineContent = await fs.readFile(baselineFilePath, "utf8")
    let baselineViolations

    try {
      baselineViolations = JSON.parse(baselineContent)
    } catch (error) {
      logWarning(`Failed to parse baseline file: ${error.message}. All violations will be reported.`)
      return currentViolations
    }

    if (!Array.isArray(baselineViolations)) {
      logWarning("Baseline file does not contain an array of violations. All violations will be reported.")
      return currentViolations
    }

    logInfo(`Loaded ${baselineViolations.length} violations from baseline`)

    // Create a map of baseline violations for faster lookup
    const baselineMap = new Map()

    for (const violation of baselineViolations) {
      // Create a unique key for each violation
      const key = `${violation.file}:${violation.line}:${violation.rule}`
      baselineMap.set(key, violation)
    }

    // Filter out violations that are already in the baseline
    const newViolations = currentViolations.filter((violation) => {
      const key = `${violation.file}:${violation.line}:${violation.rule}`
      return !baselineMap.has(key)
    })

    logInfo(`Found ${newViolations.length} new violations not in the baseline`)
    return newViolations
  } catch (error) {
    logWarning(`Error comparing with baseline: ${error.message}. All violations will be reported.`)
    return currentViolations
  }
}

module.exports = {
  compareWithBaseline,
}
