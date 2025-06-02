const github = require("@actions/github")
const { exec } = require("@actions/exec")

/**
 * Gets files changed in the PR that match the sourcePath
 * @param {string} token - GitHub token
 * @param {string} sourcePath - Root source path to filter files
 * @returns {Object} Object containing new and modified files
 */
async function getChangedFiles(token, sourcePath) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo
  const prNumber = github.context.payload.pull_request.number

  // Get PR files
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  })

  // Separate new files from modified files
  const newFiles = []
  const modifiedFiles = []

  files.forEach((file) => {
    const filename = file.filename

    // Check if the file matches the sourcePath
    let matchesSourcePath = false
    if (sourcePath.endsWith("**")) {
      // For glob patterns like 'force-app/main/default/**'
      const baseDir = sourcePath.slice(0, -2)
      matchesSourcePath = filename.startsWith(baseDir)
    } else if (sourcePath.endsWith("*")) {
      // For patterns like 'force-app/main/default/*'
      const baseDir = sourcePath.slice(0, -1)
      // Check if it's a direct child of the directory
      const relativePath = filename.startsWith(baseDir) ? filename.slice(baseDir.length) : ""
      matchesSourcePath = relativePath && !relativePath.includes("/")
    } else {
      // For exact directory match like 'force-app/main/default/'
      matchesSourcePath = filename.startsWith(sourcePath)
    }

    if (matchesSourcePath) {
      if (file.status === "added") {
        newFiles.push(filename)
      } else {
        modifiedFiles.push(filename)
      }
    }
  })

  return {
    totalFiles: files.length,
    newFiles,
    modifiedFiles,
    filteredFiles: [...newFiles, ...modifiedFiles],
  }
}

/**
 * Gets all files in the repository that match the sourcePath
 * @param {string} sourcePath - Root source path to filter files
 * @returns {Object} Object containing filtered files
 */
async function getAllFiles(sourcePath) {
  // Use git ls-files to get all tracked files
  let output = ""
  const options = {
    silent: true, // Suppress command output
    listeners: {
      stdout: (data) => {
        output += data.toString()
      },
    },
  }

  await exec("git", ["ls-files"], options)

  const allFiles = output.split("\n").filter((file) => file.trim() !== "")

  // Filter files by sourcePath
  const filteredFiles = allFiles.filter((filename) => {
    // Check if the file starts with the sourcePath
    // Handle both exact path and glob patterns
    if (sourcePath.endsWith("**")) {
      // For glob patterns like 'force-app/main/default/**'
      const baseDir = sourcePath.slice(0, -2)
      return filename.startsWith(baseDir)
    } else if (sourcePath.endsWith("*")) {
      // For patterns like 'force-app/main/default/*'
      const baseDir = sourcePath.slice(0, -1)
      // Check if it's a direct child of the directory
      const relativePath = filename.startsWith(baseDir) ? filename.slice(baseDir.length) : ""
      return relativePath && !relativePath.includes("/")
    } else {
      // For exact directory match like 'force-app/main/default/'
      return filename.startsWith(sourcePath)
    }
  })

  return {
    totalFiles: allFiles.length,
    filteredFiles,
    // When scanning all files, we don't distinguish between new and modified
    newFiles: [],
    modifiedFiles: filteredFiles,
  }
}

/**
 * Filters files based on file type configuration
 * @param {Object} fileType - File type configuration
 * @param {Array} allFiles - All files to filter
 * @returns {Array} Filtered files matching the file type
 */
function filterFilesByType(fileType, allFiles) {
  return allFiles.filter((file) => {
    // Check if file starts with the pattern
    if (!file.startsWith(fileType.sourcePath)) {
      return false
    }

    // Check if file ends with any of the extensions
    return fileType.fileExtensions.some((ext) => file.endsWith(ext))
  })
}

module.exports = {
  getChangedFiles,
  getAllFiles,
  filterFilesByType,
}
