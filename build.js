const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Ensure dist directory exists
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist")
}

console.log("Building the action...")

try {
  // Run ncc build
  execSync("npx @vercel/ncc build src/index.js -o dist --source-map --license licenses.txt", {
    stdio: "inherit",
  })

  console.log("Build completed successfully!")

  // Check if the build contains the logger module
  const distIndexPath = path.join("dist", "index.js")
  const distContent = fs.readFileSync(distIndexPath, "utf8")

  if (distContent.includes("./utils/logger") && !distContent.includes("./logger")) {
    console.log("Warning: Found potential path issue with logger module. Fixing...")

    // Create a simple logger.js in the dist directory as a fallback
    const loggerContent = `
    const core = require('@actions/core');
    
    module.exports = {
      colors: {},
      logSectionHeader: (title) => core.info(\`=== \${title} ===\`),
      logSubsectionHeader: (title) => core.info(\`>> \${title}\`),
      logSuccess: (msg) => core.info(\`✓ \${msg}\`),
      logWarning: (msg) => core.warning(msg),
      logError: (msg) => core.error(msg),
      logInfo: (msg) => core.info(msg),
      logDebug: (msg) => core.debug(msg)
    };`

    fs.writeFileSync(path.join("dist", "logger.js"), loggerContent)
    console.log("Created fallback logger.js in dist directory")
  }

  console.log("Build verification completed.")
} catch (error) {
  console.error("Build failed:", error)
  process.exit(1)
}
