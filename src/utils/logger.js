// Color and formatting helpers for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
}

const core = require("@actions/core")

/**
 * Log a section header with decorative borders
 * @param {string} title - The section title
 */
function logSectionHeader(title) {
  const line = "=".repeat(title.length + 8)
  core.info("")
  core.info(`${colors.cyan}${line}${colors.reset}`)
  core.info(
    `${colors.cyan}===${colors.reset} ${colors.bright}${colors.white}${title}${colors.reset} ${colors.cyan}===${colors.reset}`,
  )
  core.info(`${colors.cyan}${line}${colors.reset}`)
  core.info("")
}

/**
 * Log a subsection header
 * @param {string} title - The subsection title
 */
function logSubsectionHeader(title) {
  core.info("")
  core.info(`${colors.bright}${colors.cyan}>> ${title}${colors.reset}`)
  core.info(`${colors.cyan}${"─".repeat(title.length + 4)}${colors.reset}`)
}

/**
 * Log a success message
 * @param {string} message - The success message
 */
function logSuccess(message) {
  core.info(`${colors.green}✓ ${message}${colors.reset}`)
}

/**
 * Log a warning message
 * @param {string} message - The warning message
 */
function logWarning(message) {
  core.warning(`${colors.yellow}⚠ ${message}${colors.reset}`)
}

/**
 * Log an error message
 * @param {string} message - The error message
 */
function logError(message) {
  core.error(`${colors.red}✗ ${message}${colors.reset}`)
}

/**
 * Log an info message
 * @param {string} message - The info message
 */
function logInfo(message) {
  core.info(`${colors.blue}ℹ ${message}${colors.reset}`)
}

/**
 * Log a debug message (dimmed)
 * @param {string} message - The debug message
 */
function logDebug(message) {
  core.debug(`${colors.dim}${message}${colors.reset}`)
}

/**
 * Set an output variable
 * @param {string} name - The name of the output
 * @param {string|number|boolean} value - The value of the output
 */
function setOutput(name, value) {
  core.setOutput(name, value)
  logDebug(`Set output ${name}=${value}`)
}

/**
 * Set the action as failed
 * @param {string} message - The failure message
 */
function setFailed(message) {
  core.setFailed(message)
  logError(`Action failed: ${message}`)
}

/**
 * Create a notice annotation
 * @param {string} message - The notice message
 * @param {Object} options - Options for the notice
 */
function notice(message, options) {
  core.notice(message, options)
}

module.exports = {
  colors,
  logSectionHeader,
  logSubsectionHeader,
  logSuccess,
  logWarning,
  logError,
  logInfo,
  logDebug,
  setOutput,
  setFailed,
  notice,
}
