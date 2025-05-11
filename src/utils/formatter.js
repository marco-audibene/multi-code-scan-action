const core = require("@actions/core")
const fs = require("fs").promises
const path = require("path")
const { logSuccess, logWarning, logInfo, colors } = require("./logger")

// Store project root path for normalization
let projectRootPath = ""

/**
 * Sets the project root path for file normalization
 * @param {string} rootPath - The project root path
 */
function setProjectRootPath(rootPath) {
  projectRootPath = rootPath
  logInfo(`Set project root path to: ${rootPath}`)
}

/**
 * Creates a visual separator line
 */
function displaySeparator() {
  core.info(`${colors.dim}${"─".repeat(65)}${colors.reset}`)
}

/**
 * Formats and displays violations in a simplified format
 * @param {Array} violations - Tool-specific violations
 * @param {string} fileName - Name of the file with violations
 * @param {Function} getLineNumber - Function to extract line number from a violation
 * @param {Function} getMessage - Function to extract message from a violation
 * @param {Function} getRule - Function to extract rule from a violation
 * @param {Function} getDocUrl - Function to extract documentation URL from a violation
 */
function displayFileViolations(violations, fileName, getLineNumber, getMessage, getRule, getDocUrl) {
  if (violations.length === 0) return

  // Create a visual separator for the file
  core.info(`\nFile: ${colors.bright}${fileName}${colors.reset}`)
  displaySeparator()

  // Display each violation in a simplified format
  for (const violation of violations) {
    const line = getLineNumber(violation)
    const message = getMessage(violation)
    const rule = getRule(violation)
    const docUrl = getDocUrl ? getDocUrl(violation) : ""

    // Format: Line XX: Message (Rule) Documentation: URL
    let output = `Line ${line}: ${message} (${rule})`
    if (docUrl && docUrl.trim() !== "") {
      output += `\n  Documentation: ${docUrl}`
    }

    core.info(output)
  }

  displaySeparator()
}

/**
 * Creates a summary of violations
 * @param {Array} violations - All violations
 * @param {string} name - Name of the file type
 */
function displayViolationSummary(violations, name) {
  if (violations.length > 0) {
    logWarning(`Found ${violations.length} violation${violations.length === 1 ? "" : "s"} in ${name} files`)
  }
}

/**
 * Handles temporary file creation
 * @param {string} filePath - Path for the file
 * @param {string} content - Content to write to the file
 */
async function createTempFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content)
    return filePath
  } catch (error) {
    logWarning(`Failed to create temporary file ${filePath}: ${error.message}`)
    throw error
  }
}

/**
 * Cleans up temporary files
 * @param {Array} filePaths - Paths to files to clean up
 */
async function cleanupTempFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      logWarning(`Failed to clean up temporary file ${filePath}: ${error.message}`)
    }
  }
}

/**
 * Normalizes file paths using the sourcePath from configuration
 * @param {string} filePath - The file path to normalize
 * @param {string} sourcePath - The source path from configuration
 * @returns {string} - The normalized file path
 */
function normalizeFilePath(filePath, sourcePath) {
  if (!filePath) return filePath

  // Remove common CI workspace prefixes
  const workspacePrefixes = ["/home/runner/work/", "/github/workspace/", "/workspace/", "/app/", "/src/"]

  let normalizedPath = filePath

  // Remove workspace prefixes
  for (const prefix of workspacePrefixes) {
    if (normalizedPath.includes(prefix)) {
      normalizedPath = normalizedPath.split(prefix)[1]
      break
    }
  }

  // Remove repository name if present (first directory in path)
  const pathParts = normalizedPath.split("/")
  if (pathParts.length > 1) {
    // Check if the first part looks like a repository name
    const firstPart = pathParts[0]
    if (firstPart.includes(".") || firstPart.includes("-") || firstPart.includes("_")) {
      normalizedPath = pathParts.slice(1).join("/")
    }
  }

  // If we have a sourcePath, ensure the path starts with it
  if (sourcePath) {
    // Now check if the path already includes the sourcePath
    if (!normalizedPath.includes(sourcePath)) {
      // Find the part of the path that matches the end of the sourcePath
      const sourcePathParts = sourcePath.split("/").filter((p) => p)
      const lastSourcePart = sourcePathParts[sourcePathParts.length - 1]

      if (lastSourcePart && normalizedPath.includes(lastSourcePart + "/")) {
        // Find where the matching part starts
        const index = normalizedPath.indexOf(lastSourcePart + "/")
        // Get the file-specific part (after the matching part)
        const fileSpecificPart = normalizedPath.substring(index + lastSourcePart.length + 1)
        // Reconstruct the path with the full sourcePath
        normalizedPath = path.join(sourcePath, fileSpecificPart)
      } else {
        // If we can't find a matching part, just prepend the sourcePath
        normalizedPath = path.join(sourcePath, normalizedPath)
      }
    } else {
      // If the path already includes the sourcePath, make sure it starts with it
      const sourcePathIndex = normalizedPath.indexOf(sourcePath)
      if (sourcePathIndex > 0) {
        normalizedPath = normalizedPath.substring(sourcePathIndex)
      }
    }
  }

  return normalizedPath
}

/**
 * Groups violations by file for display
 * @param {Array} files - Array of file objects with violations
 * @param {Function} getViolations - Function to extract violations from a file
 * @param {Function} getFileName - Function to extract file name from a file
 * @param {Function} getLineNumber - Function to extract line number from a violation
 * @param {Function} getMessage - Function to extract message from a violation
 * @param {Function} getRule - Function to extract rule from a violation
 * @param {Function} getDocUrl - Function to extract documentation URL from a violation (optional)
 * @param {string} sourcePath - The source path from configuration
 */
function displayViolationsByFile(
  files,
  getViolations,
  getFileName,
  getLineNumber,
  getMessage,
  getRule,
  getDocUrl,
  sourcePath,
) {
  // First, count total violations
  let totalViolations = 0
  const filesWithViolations = []

  for (const file of files) {
    const fileName = getFileName(file)
    if (!fileName) continue

    const fileViolations = getViolations(file) || []
    if (fileViolations.length > 0) {
      totalViolations += fileViolations.length
      filesWithViolations.push(file)
    }
  }

  // Display summary before details with a blank line after
  if (totalViolations > 0) {
    core.info("") // Add blank line before warning
    logWarning(`Found ${totalViolations} violation${totalViolations === 1 ? "" : "s"}`)

    // Process each file with violations
    for (const file of filesWithViolations) {
      let fileName = getFileName(file)
      // Normalize the file path using the sourcePath
      fileName = normalizeFilePath(fileName, sourcePath)

      const fileViolations = getViolations(file) || []
      displayFileViolations(fileViolations, fileName, getLineNumber, getMessage, getRule, getDocUrl)
    }
  }
}

module.exports = {
  setProjectRootPath,
  displaySeparator,
  displayFileViolations,
  displayViolationSummary,
  createTempFile,
  cleanupTempFiles,
  displayViolationsByFile,
  normalizeFilePath,
}
