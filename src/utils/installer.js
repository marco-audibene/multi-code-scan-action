const core = require("@actions/core")
const exec = require("@actions/exec")
const tc = require("@actions/tool-cache")
const path = require("path")
const fs = require("fs").promises
const { logSuccess, logWarning, logInfo, logSubsectionHeader } = require("./logger")

/**
 * Installs PMD and ESLint with required plugins
 */
async function installTools() {
  await installPMD()

  // Add visual separation between tools
  core.info("\n")

  // Use subsection header instead of section header for ESLint
  logSubsectionHeader("Installing ESLint")

  await installESLint()
}

/**
 * Installs PMD
 */
async function installPMD() {
  logSubsectionHeader("Installing PMD")

  const pmdVersion = "7.0.0"
  const pmdUrl = `https://github.com/pmd/pmd/releases/download/pmd_releases%2F${pmdVersion}/pmd-dist-${pmdVersion}-bin.zip`

  logInfo(`Downloading PMD ${pmdVersion}...`)

  // Download PMD
  const pmdZipPath = await tc.downloadTool(pmdUrl)

  // Extract PMD
  const pmdExtractPath = await tc.extractZip(pmdZipPath)

  // Add PMD to PATH
  const pmdBinPath = path.join(pmdExtractPath, `pmd-bin-${pmdVersion}`, "bin")
  core.addPath(pmdBinPath)

  // Verify installation
  await exec.exec("pmd", ["--version"])

  logSuccess(`PMD ${pmdVersion} installed successfully`)
}

/**
 * Installs ESLint and required plugins
 */
async function installESLint() {
  logInfo("Installing ESLint and plugins...")

  // Define core ESLint dependencies
  const eslintCoreDeps = ["eslint@8.42.0", "@babel/eslint-parser@7.22.9", "@babel/core@7.22.9"]

  // Check if Salesforce plugins should be installed
  const installSalesforcePlugins = core.getInput("installSalesforcePlugins") === "true"

  // Check if TypeScript plugins should be installed
  const installTypeScriptPlugins = core.getInput("installTypeScriptPlugins") === "true"

  // Define Salesforce-specific dependencies
  const salesforceDeps = [
    "@salesforce/eslint-config-lwc@3.5.2",
    "@lwc/eslint-plugin-lwc@1.6.3",
    "@salesforce/eslint-plugin-aura@2.1.0",
    "@babel/plugin-proposal-class-properties@7.18.6",
    "@babel/plugin-proposal-decorators@7.22.7",
  ]

  // Define TypeScript-specific dependencies
  const typeScriptDeps = [
    "@typescript-eslint/parser@6.0.0",
    "@typescript-eslint/eslint-plugin@6.0.0",
    "typescript@5.0.0",
  ]

  // Combine dependencies based on configuration
  let eslintDeps = [...eslintCoreDeps]

  if (installSalesforcePlugins) {
    eslintDeps = [...eslintDeps, ...salesforceDeps]
  }

  if (installTypeScriptPlugins) {
    eslintDeps = [...eslintDeps, ...typeScriptDeps]
  }

  // Install ESLint and plugins (suppress detailed output)
  const options = {
    silent: true,
    ignoreReturnCode: false,
  }

  try {
    await exec.exec("npm", ["install", "--save-dev", ...eslintDeps, "--legacy-peer-deps"], options)
  } catch (error) {
    logWarning("ESLint dependencies installation had warnings (this is usually fine)")
  }

  // Create configuration files based on project type
  if (installSalesforcePlugins) {
    await createSalesforceConfigs()
  }

  if (installTypeScriptPlugins) {
    await createTypeScriptConfigs()
  }

  if (!installSalesforcePlugins && !installTypeScriptPlugins) {
    await createGenericConfigs()
  }

  // Verify installation - get version
  let eslintVersion = ""
  await exec.exec("npx", ["eslint", "--version"], {
    listeners: {
      stdout: (data) => {
        eslintVersion = data.toString().trim()
      },
    },
  })

  // Display ESLint ASCII logo
  displayESLintLogo()

  // Display version info right after logo
  core.info(`ESLint ${eslintVersion}`)

  logSuccess(`ESLint ${eslintVersion} installed successfully`)
}

/**
 * Creates Salesforce-specific ESLint configurations
 */
async function createSalesforceConfigs() {
  // Create a basic .babelrc file for ESLint to use
  const babelrcContent = JSON.stringify(
    {
      plugins: [
        ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: false }],
        "@babel/plugin-proposal-class-properties",
      ],
    },
    null,
    2,
  )

  await fs.writeFile(".babelrc", babelrcContent)

  // Create standard configuration files for Salesforce components
  const lwcStandardConfig = {
    extends: ["@salesforce/eslint-config-lwc/recommended"],
    parser: "@babel/eslint-parser",
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2020,
      sourceType: "module",
    },
  }

  const auraStandardConfig = {
    extends: ["@salesforce/eslint-plugin-aura/recommended"],
    parser: "@babel/eslint-parser",
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2015,
      sourceType: "script",
    },
  }

  // Write these to standard locations
  await fs.writeFile("standard-lwc-config.json", JSON.stringify(lwcStandardConfig, null, 2))
  await fs.writeFile("standard-aura-config.json", JSON.stringify(auraStandardConfig, null, 2))
}

/**
 * Creates TypeScript-specific ESLint configurations
 */
async function createTypeScriptConfigs() {
  // Create standard configuration for TypeScript
  const tsStandardConfig = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "@typescript-eslint/recommended"],
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
  }

  // Create configuration for TypeScript React (TSX)
  const tsxStandardConfig = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "@typescript-eslint/recommended"],
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
  }

  // Write these to standard locations
  await fs.writeFile("standard-ts-config.json", JSON.stringify(tsStandardConfig, null, 2))
  await fs.writeFile("standard-tsx-config.json", JSON.stringify(tsxStandardConfig, null, 2))
}

/**
 * Creates generic ESLint configurations
 */
async function createGenericConfigs() {
  // Create a basic .babelrc file for ESLint to use
  const babelrcContent = JSON.stringify(
    {
      presets: ["@babel/preset-env"],
    },
    null,
    2,
  )

  await fs.writeFile(".babelrc", babelrcContent)

  // Create standard configuration for JavaScript
  const jsStandardConfig = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: ["eslint:recommended"],
    parser: "@babel/eslint-parser",
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2021,
      sourceType: "module",
    },
    rules: {
      // Basic recommended rules
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  }

  // Write this to a standard location
  await fs.writeFile("standard-js-config.json", JSON.stringify(jsStandardConfig, null, 2))
}

/**
 * Displays an ASCII art ESLint logo
 */
function displayESLintLogo() {
  // Using the previous ESLint logo that the user liked
  const logo = `
  ███████╗███████╗██      ██╗███╗   ██╗████████╗
  ██╔════╝██╔════╝██      ██║████╗  ██║╚══██╔══╝
  █████╗  ███████╗██      ██║██╔██╗ ██║   ██║   
  ██╔══╝  ╚════██║██      ██║██║╚██╗██║   ██║   
  ███████╗███████║███████╗██║██║ ╚████║   ██║   
  ╚══════╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝   ╚═╝   
  `

  core.info(logo)
}

// Export the installTools function
module.exports.installTools = installTools
