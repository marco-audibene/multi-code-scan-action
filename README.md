# Code Quality Action

A comprehensive GitHub Action for running code quality checks using PMD and ESLint. **This action supports all languages compatible with PMD and ESLint**, making it suitable for diverse codebases. It includes **specialized support for Salesforce development** with built-in configurations for Apex, Lightning Web Components (LWC), and Aura components.

## Features

- **Multi-language support**: Analyzes any language supported by PMD (Java, Apex, JavaScript, XML, etc.) and ESLint (JavaScript, TypeScript, JSX, etc.)
- **Salesforce-optimized**: Built-in support for Apex, LWC, and Aura components with Salesforce-specific rules and plugins
- Creates GitHub annotations for violations with precise file and line information
- Posts comprehensive summary comments on PRs with detailed violation breakdowns
- Supports scanning only changed files or the entire codebase
- Enables caching for faster subsequent runs
- Generates reports in multiple formats (GitHub annotations, JSON, HTML, text)
- Configurable violation thresholds with flexible enforcement strategies
- Supports baseline comparison to focus on new issues
- **Three quality enforcement modes**: Absolutist (default), Differential, and Legacy

## Usage

### Basic Usage

<pre><code class="language-yaml">name: Code Quality

on:
  pull_request:
    types: [opened, reopened, synchronize]
    paths:  # Optional: only run when relevant files change
      - 'src/**'
      - '.eslintrc.*'
      - 'pmd-rules/**'

jobs:
  code-scan:
    name: Run Code Quality Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 1

      - name: Run Code Quality Scan
        uses: your-org/multi-code-scan-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sourcePath: "src/"
          file-types-config: |
            [
              {
                "name": "Java",
                "sourcePath": "src/main/java/",
                "fileExtensions": [".java"],
                "analyzer": "pmd",
                "rulesPaths": [
                  "./pmd-rules/java-ruleset.xml"
                ]
              },
              {
                "name": "JavaScript",
                "sourcePath": "src/main/js/",
                "fileExtensions": [".js", ".jsx"],
                "analyzer": "eslint",
                "rulesPaths": [
                  "./eslint-rules/js-ruleset.js"
                ]
              }
            ]
</code></pre>

### Salesforce Usage

For Salesforce projects, enable the Salesforce-specific plugins and configurations:

<pre><code class="language-yaml">- name: Run Code Quality Scan
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sourcePath: "force-app/main/default/"
    installSalesforcePlugins: true
    file-types-config: |
      [
        {
          "name": "Apex class",
          "sourcePath": "force-app/main/default/classes/",
          "fileExtensions": [".cls", ".cls-meta.xml"],
          "analyzer": "pmd",
          "rulesPaths": [
            "./pmd-rules/apex-ruleset.xml"
          ]
        },
        {
          "name": "LWC",
          "sourcePath": "force-app/main/default/lwc/",
          "fileExtensions": [".js", ".html", ".css", ".xml"],
          "analyzer": "eslint",
          "rulesPaths": [
            "./eslint-rules/lwc-ruleset.js"
          ]
        }
      ]
</code></pre>

## Manual and Scheduled Scans

For manual testing, debugging, or scheduled quality audits, you can create workflows that scan the entire project using `workflow_dispatch`:

\`\`\`yaml
name: Full Project Code Quality Audit

on:
  workflow_dispatch:
    inputs:
      fail_on_issues:
        description: 'Fail workflow if quality issues are found'
        required: false
        default: 'false'
        type: boolean
      scan_path:
        description: 'Path to scan (default: entire project)'
        required: false
        default: 'src/'
        type: string

  schedule:
    # Run weekly audit on Sundays at 2 AM UTC
    - cron: '0 2 * * 0'

jobs:
  full-audit:
    name: Full Project Quality Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Run Full Project Scan
        uses: your-org/multi-code-scan-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sourcePath: ${{ github.event.inputs.scan_path || 'src/' }}
          
          # Full project scan settings
          scanChangedFilesOnly: false              # Scan ALL files
          failOnQualityIssues: ${{ github.event.inputs.fail_on_issues || 'false' }}
          
          # Relaxed thresholds for full project audits
          maxCriticalViolations: 50
          maxMediumViolations: 200
          
          file-types-config: |
            [
              {
                "name": "Java",
                "sourcePath": "src/main/java/",
                "fileExtensions": [".java"],
                "analyzer": "pmd"
              }
            ]
\`\`\`

### When to Use Each Approach

| Workflow Type | Use Case | Scan Scope | Enforcement |
|---------------|----------|------------|-------------|
| **Pull Request** | Code review, CI/CD gates | Changed files only | Strict (blocks merging) |
| **Manual Dispatch** | Testing, debugging, demos | Configurable | Flexible (usually non-blocking) |
| **Scheduled** | Regular audits, reporting | Entire project | Flexible (monitoring) |

## Quality Enforcement Modes

This action supports three different quality enforcement approaches:

### 1. Absolutist Approach (Default)

Applies the same strict rules to all files, both new and modified. This is the most conservative approach and behaves similarly to the standard PMD GitHub Action.

<pre><code class="language-yaml">- name: Run Code Quality Scan (Absolutist - Default)
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sourcePath: "src/"
    # These are the default values (can be omitted)
    strictNewFiles: true                         # Any violation in new files fails the check
    maxViolationsForModifiedFiles: 0             # Allow zero violations in modified files (strict)
    maxCriticalViolationsForModifiedFiles: 0     # Allow zero critical violations in modified files
    file-types-config: |
      [...]
</code></pre>

**When to use**: New projects, teams with high quality standards, or when you want consistent rules across all code.

### 2. Differential Enforcement

Applies strict rules to new files while being more lenient with modified files. This helps teams gradually improve code quality without being overwhelmed by legacy issues.

<pre><code class="language-yaml">- name: Run Code Quality Scan (Differential)
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sourcePath: "src/"
    # Differential enforcement settings
    strictNewFiles: true                         # Any violation in new files fails the check
    maxViolationsForModifiedFiles: 10            # Allow up to 10 violations in modified files
    maxCriticalViolationsForModifiedFiles: 0     # Don't allow any critical violations in modified files
    file-types-config: |
      [...]
</code></pre>

**When to use**: Legacy projects, teams transitioning to higher quality standards, or when you want to prevent new technical debt while tolerating existing issues.

### 3. Legacy Mode

Uses overall violation thresholds without distinguishing between new and modified files. This is a lighter approach that focuses on overall code quality metrics.

<pre><code class="language-yaml">- name: Run Code Quality Scan (Legacy)
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sourcePath: "src/"
    # Legacy mode settings
    strictNewFiles: false                        # Don't apply special rules to new files
    maxCriticalViolations: 0                     # Maximum critical violations across all files
    maxMediumViolations: 10                      # Maximum medium violations across all files
    file-types-config: |
      [...]
</code></pre>

**When to use**: When you want simple, overall thresholds without file-type distinction.

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `github-token` | GitHub token for creating annotations and comments | Yes | N/A |
| `sourcePath` | Root source path to filter changed files (e.g., src/, force-app/) | Yes | N/A |
| `file-types-config` | JSON configuration of file types to analyze | Yes | N/A |
| `scanChangedFilesOnly` | Whether to scan only changed files (true) or all files (false) | No | `true` |
| `enableScanCache` | Enable caching for faster scans | No | `true` |
| `outputFormats` | Comma-separated list of output formats (github,json,html,text) | No | `github` |
| `maxCriticalViolations` | Maximum number of critical/high violations allowed before failing | No | `0` |
| `maxMediumViolations` | Maximum number of medium violations allowed before failing | No | `10` |
| `previousViolationsFile` | Path to file containing previous violations to ignore | No | `""` |
| `failOnQualityIssues` | Whether to fail the workflow if quality issues exceed thresholds | No | `true` |
| `check-name` | Name of the check run to create | No | `Code Quality Scan` |
| `strictNewFiles` | Whether to apply strict rules to new files (any violation fails) | No | `true` |
| `maxViolationsForModifiedFiles` | Maximum number of violations allowed for modified files before failing | No | `0` |
| `maxCriticalViolationsForModifiedFiles` | Maximum number of critical/high violations allowed for modified files before failing | No | `0` |
| `installSalesforcePlugins` | Whether to install Salesforce-specific ESLint plugins | No | `false` |

## Outputs

| Name | Description |
|------|-------------|
| `total-violations` | Total number of violations found |
| `critical-violations` | Number of critical/high violations found |
| `medium-violations` | Number of medium violations found |
| `json-report-path` | Path to the JSON report file (if generated) |
| `html-report-path` | Path to the HTML report file (if generated) |
| `text-report-path` | Path to the text report file (if generated) |
| `violations` | JSON string containing all violations found |
| `new-file-violations` | Number of violations in new files |
| `modified-file-violations` | Number of violations in modified files |

## File Types Configuration

The `file-types-config` input is a JSON array of objects, each representing a file type to analyze. Each object has the following properties:

| Property | Description | Required |
|----------|-------------|----------|
| `name` | Name of the file type | Yes |
| `sourcePath` | Path to the source files | Yes |
| `fileExtensions` | Array of file extensions to analyze | Yes |
| `analyzer` | Analyzer to use (`pmd` or `eslint`) | Yes |
| `rulesPaths` | Array of paths to ruleset files | No |

### Default Rulesets

If `rulesPaths` is not specified, the action will use default rulesets:

#### For PMD:
- If no rulesets are specified, PMD's built-in default rulesets are used
- The log will show: `Using PMD default rulesets`

#### For ESLint:
- If no rulesets are specified and `installSalesforcePlugins` is true:
  - If the file type name includes "lwc", it uses "standard-lwc-config.json"
  - If the file type name includes "aura", it uses "standard-aura-config.json"
  - Otherwise, it uses "standard-js-config.json"
- If no rulesets are specified and `installSalesforcePlugins` is false:
  - It uses "standard-js-config.json" for all JavaScript files
- The log will show: `Using standard configuration: standard-js-config.json` or similar

## Salesforce ESLint Configuration

When using custom ESLint rulesets for Salesforce components, follow these configuration structures:

### Lightning Web Components (LWC)

\`\`\`javascript
// eslint-rules/lwc-ruleset.js
module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ["classProperties", ["decorators", { decoratorsBeforeExport: false }]],
      },
    },
  },
  plugins: ["@lwc/eslint-plugin-lwc"],
  rules: {
    "no-console": ["warn", { allow: ["error"] }],
    "no-eval": "error",
    "no-unused-vars": "error",
    "@lwc/lwc/no-async-operation": "error",
    "@lwc/lwc/no-inner-html": "error",
    "@lwc/lwc/no-document-query": "error",
  },
}
\`\`\`

### Aura Components

\`\`\`javascript
// eslint-rules/aura-ruleset.js
module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2018,
    sourceType: "script",
  },
  plugins: ["@salesforce/eslint-plugin-aura"],
  rules: {
    "no-console": ["warn", { allow: ["error"] }],
    "no-eval": "error",
    "no-alert": "error",
    "no-unused-vars": "error",
    "@salesforce/aura/no-deprecated-component": "error",
    "@salesforce/aura/no-js-in-markup": "error",
  },
}
\`\`\`

### Key Configuration Notes:

1. **Parser Configuration**: Both LWC and Aura require `@babel/eslint-parser` with specific parser options
2. **Plugins**: 
   - LWC uses `@lwc/eslint-plugin-lwc`
   - Aura uses `@salesforce/eslint-plugin-aura`
3. **Parser Options**:
   - LWC: `sourceType: "module"` with decorators and class properties support
   - Aura: `sourceType: "script"` with ES2018 features
4. **Rule Prefixes**:
   - LWC rules: `@lwc/lwc/rule-name`
   - Aura rules: `@salesforce/aura/rule-name`

### Common Salesforce ESLint Rules:

| Component Type | Rule | Description |
|----------------|------|-------------|
| **LWC** | `@lwc/lwc/no-async-operation` | Prevents setTimeout/setInterval usage |
| **LWC** | `@lwc/lwc/no-inner-html` | Prevents innerHTML usage for security |
| **LWC** | `@lwc/lwc/no-document-query` | Prevents direct DOM queries |
| **Aura** | `@salesforce/aura/no-deprecated-component` | Flags deprecated Aura components |
| **Aura** | `@salesforce/aura/no-js-in-markup` | Prevents JavaScript in markup |
| **Both** | `no-console` | Restricts console usage (allow error only) |
| **Both** | `no-eval` | Prevents eval() usage for security |

For complete rule documentation, see:
- [LWC ESLint Rules](https://github.com/salesforce/eslint-plugin-lwc/tree/master/docs/rules)
- [Aura ESLint Rules](https://github.com/forcedotcom/eslint-plugin-aura/tree/master/docs/rules)

## Examples

### Java Project

<pre><code class="language-yaml">name: Java Code Quality

on:
  pull_request:
    types: [opened, reopened, synchronize]
    paths:
      - 'src/**'
      - 'pmd-rules/**'

jobs:
  code-scan:
    name: Run Code Quality Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Run Code Quality Scan
        uses: your-org/multi-code-scan-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sourcePath: "src/main/java/"
          file-types-config: |
            [
              {
                "name": "Java",
                "sourcePath": "src/main/java/",
                "fileExtensions": [".java"],
                "analyzer": "pmd",
                "rulesPaths": [
                  "./pmd-rules/java-ruleset.xml"
                ]
              }
            ]
</code></pre>

### JavaScript Project

<pre><code class="language-yaml">name: JavaScript Code Quality

on:
  pull_request:
    types: [opened, reopened, synchronize]
    paths:
      - 'src/**'
      - '.eslintrc.*'
      - 'package.json'

jobs:
  code-scan:
    name: Run Code Quality Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Run Code Quality Scan
        uses: your-org/multi-code-scan-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sourcePath: "src/"
          file-types-config: |
            [
              {
                "name": "JavaScript",
                "sourcePath": "src/",
                "fileExtensions": [".js", ".jsx"],
                "analyzer": "eslint",
                "rulesPaths": [
                  "./.eslintrc.js"
                ]
              }
            ]
</code></pre>

### Salesforce Project (Differential Enforcement)

<pre><code class="language-yaml">name: Salesforce Code Quality

on:
  pull_request:
    types: [opened, reopened, synchronize]
    paths:
      - 'force-app/**'
      - 'pmd-rules/**'
      - 'eslint-rules/**'

jobs:
  code-scan:
    name: Run Code Quality Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Run Code Quality Scan
        uses: your-org/multi-code-scan-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sourcePath: "force-app/main/default/"
          installSalesforcePlugins: true
          # Use differential enforcement for legacy Salesforce projects
          strictNewFiles: true                         # Any violation in new files fails the check
          maxViolationsForModifiedFiles: 10            # Allow up to 10 violations in modified files
          maxCriticalViolationsForModifiedFiles: 0     # Don't allow any critical violations in modified files
          file-types-config: |
            [
              {
                "name": "Apex class",
                "sourcePath": "force-app/main/default/classes/",
                "fileExtensions": [".cls", ".cls-meta.xml"],
                "analyzer": "pmd",
                "rulesPaths": [
                  "./pmd-rules/apex-ruleset.xml"
                ]
              },
              {
                "name": "Apex trigger",
                "sourcePath": "force-app/main/default/triggers/",
                "fileExtensions": [".trigger", ".trigger-meta.xml"],
                "analyzer": "pmd",
                "rulesPaths": [
                  "./pmd-rules/apex-ruleset.xml"
                ]
              },
              {
                "name": "LWC",
                "sourcePath": "force-app/main/default/lwc/",
                "fileExtensions": [".js", ".html", ".css", ".xml"],
                "analyzer": "eslint",
                "rulesPaths": [
                  "./eslint-rules/lwc-ruleset.js"
                ]
              },
              {
                "name": "Aura",
                "sourcePath": "force-app/main/default/aura/",
                "fileExtensions": [".js", ".cmp", ".app", ".evt", ".intf", ".design", ".css", ".xml"],
                "analyzer": "eslint",
                "rulesPaths": [
                  "./eslint-rules/aura-ruleset.js"
                ]
              }
            ]
</code></pre>

## Path Filtering (Optional Optimization)

You can optimize workflow execution by adding path filters to only run when relevant files change:

\`\`\`yaml
on:
  pull_request:
    types: [opened, reopened, synchronize]
    paths:
      - 'src/**'                    # Source code
      - '.eslintrc.*'               # ESLint config files
      - 'pmd-rules/**'              # PMD ruleset files
      - 'package.json'              # Dependencies
      - '.github/workflows/**'      # Workflow changes
\`\`\`

### Common Path Patterns

| Pattern | Description | Example Use Case |
|---------|-------------|------------------|
| `src/**` | All files in src directory and subdirectories | Source code changes |
| `force-app/**` | Salesforce metadata and code | Salesforce projects |
| `*.js` | JavaScript files in root | Config file changes |
| `.eslintrc.*` | ESLint configuration files | Rule changes |
| `pmd-rules/**` | PMD ruleset files | PMD rule changes |

**Note**: Path filters are optional but recommended for large repositories to avoid unnecessary workflow runs.

## Using the Action Required Output

You can use the `action-required` output to conditionally run steps when violations exceed thresholds:

<pre><code class="language-yaml">- name: Run Code Quality Scan
  id: code-scan
  uses: your-org/multi-code-scan-action@v1
  with:
    # ... inputs as above ...

- name: Check if action required
  if: steps.code-scan.outputs.action-required == 'true'
  run: echo "Violations require developer action!"
</code></pre>

## License

MIT
