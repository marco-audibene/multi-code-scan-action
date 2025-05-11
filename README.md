# Code Quality Action

A GitHub Action for running code quality checks using PMD and ESLint. This action works with any codebase and has special support for Salesforce projects.

## Features

- Analyzes code with PMD and ESLint
- Creates GitHub annotations for violations
- Posts a summary comment on PRs with all violations
- Supports scanning only changed files or the entire codebase
- Enables caching for faster subsequent runs
- Generates reports in multiple formats (GitHub annotations, JSON, HTML, text)
- Configurable violation thresholds
- Supports baseline comparison to focus on new issues
- **Differential quality enforcement**: Stricter rules for new files, more lenient for modified files

## Usage

### Basic Usage

\`\`\`yaml
name: Code Quality

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
        uses: your-org/code-quality-action@v1
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
\`\`\`

### Salesforce Usage

For Salesforce projects, enable the Salesforce-specific plugins:

\`\`\`yaml
- name: Run Code Quality Scan
  uses: your-org/code-quality-action@v1
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
\`\`\`

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
| `maxViolationsForModifiedFiles` | Maximum number of violations allowed for modified files before failing | No | `10` |
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

\`\`\`yaml
- name: Run Code Quality Scan
  uses: your-org/code-quality-action@v1
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
\`\`\`

### JavaScript Project

\`\`\`yaml
- name: Run Code Quality Scan
  uses: your-org/code-quality-action@v1
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
\`\`\`

### TypeScript Project

\`\`\`yaml
- name: Run Code Quality Scan
  uses: your-org/code-quality-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sourcePath: "src/"
    file-types-config: |
      [
        {
          "name": "TypeScript",
          "sourcePath": "src/",
          "fileExtensions": [".ts", ".tsx"],
          "analyzer": "eslint",
          "rulesPaths": [
            "./.eslintrc.js"
          ]
        }
      ]
\`\`\`

### PHP Project

\`\`\`yaml
- name: Run Code Quality Scan
  uses: your-org/code-quality-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sourcePath: "src/"
    file-types-config: |
      [
        {
          "name": "PHP",
          "sourcePath": "src/",
          "fileExtensions": [".php"],
          "analyzer": "pmd",
          "rulesPaths": [
            "./pmd-rules/php-ruleset.xml"
          ]
        }
      ]
\`\`\`

### Salesforce Project

\`\`\`yaml
- name: Run Code Quality Scan
  uses: your-org/code-quality-action@v1
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
\`\`\`

## Differential Quality Enforcement

This action supports differential quality enforcement, which allows you to:

1. **Apply strict rules to new files**: By default, any violation in a new file will cause the check to fail. This ensures that new code adheres to all quality standards.

2. **Be more lenient with modified files**: For files that are being modified (not newly created), you can set higher thresholds for violations. This acknowledges the reality of working with legacy code while still encouraging improvement.

This approach helps teams gradually improve code quality without being overwhelmed by fixing all legacy issues at once.

### Configuration Examples

#### Default Configuration (Differential Enforcement)

By default, the action uses differential enforcement with these settings:

\`\`\`yaml
strictNewFiles: true                         # Any violation in new files fails the check
maxViolationsForModifiedFiles: 10            # Allow up to 10 violations in modified files
maxCriticalViolationsForModifiedFiles: 0     # Don't allow any critical violations in modified files
\`\`\`

#### Strict Enforcement for All Files

If you want to enforce the same strict rules for all files (both new and modified), use:

\`\`\`yaml
strictNewFiles: true                         # Any violation in new files fails the check
maxViolationsForModifiedFiles: 0             # Allow zero violations in modified files (strict)
maxCriticalViolationsForModifiedFiles: 0     # Allow zero critical violations in modified files
\`\`\`

#### Legacy Mode (Original Behavior)

To revert to the original behavior without differential enforcement:

\`\`\`yaml
strictNewFiles: false                        # Don't apply special rules to new files
maxCriticalViolations: 0                     # Maximum critical violations across all files
maxMediumViolations: 10                      # Maximum medium violations across all files
\`\`\`

## Using the Violations Output

You can use the violations output in subsequent steps of your workflow:

\`\`\`yaml
- name: Run Code Quality Scan
  id: code-scan
  uses: your-org/code-quality-action@v1
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
\`\`\`

## License

MIT
