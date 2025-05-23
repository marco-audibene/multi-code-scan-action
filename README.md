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

## Examples

### Java Project

<pre><code class="language-yaml">- name: Run Code Quality Scan
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

<pre><code class="language-yaml">- name: Run Code Quality Scan
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

<pre><code class="language-yaml">- name: Run Code Quality Scan
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

## Using the Violations Output

You can use the violations output in subsequent steps of your workflow:

<pre><code class="language-yaml">- name: Run Code Quality Scan
  id: code-scan
  uses: your-org/multi-code-scan-action@v1
  with:
    # ... inputs as above ...

- name: Process Violations
  if: always()
  run: |
    echo "Total violations: ${{ steps.code-scan.outputs.total-violations }}"
    echo "New file violations: ${{ steps.code-scan.outputs.new-file-violations }}"
    echo "Modified file violations: ${{ steps.code-scan.outputs.modified-file-violations }}"
    
    # Parse the violations JSON
    VIOLATIONS='${{ steps.code-scan.outputs.violations }}'
    
    # Example: Count violations by file
    echo "$VIOLATIONS" | jq 'group_by(.file) | map({file: .[0].file, count: length}) | sort_by(.count) | reverse'
    
    # Example: Get all critical violations
    echo "$VIOLATIONS" | jq '[.[] | select(.severity == "critical")]'
</code></pre>

## License

MIT
