# Code Quality Action

A comprehensive GitHub Action for running code quality checks using PMD and ESLint. **This action supports all languages compatible with PMD and ESLint**, making it suitable for diverse codebases including Java, JavaScript, TypeScript, and many others. It includes **specialized support for Salesforce development** with built-in configurations for Apex, Lightning Web Components (LWC), Aura components, and metadata validation.

## Why Choose This Action?

### 🎯 **Universal Language Support**
Unlike single-language solutions, this action works with **any language supported by PMD or ESLint**. Whether you're building enterprise Java applications, modern TypeScript web apps, or Salesforce solutions, this action adapts to your technology stack.

### 📁 **Organized Rule Management**
Keep your quality standards maintainable with **segregated rule organization**:
- **Separate rulesets by technology**: Java rules in `/pmd-rules/java/`, TypeScript rules in `/eslint-rules/typescript/`
- **Engine-specific folders**: PMD rulesets separate from ESLint configurations
- **Environment-specific rules**: Different rules for production code vs. test code
- **Team ownership**: Different teams can maintain their own ruleset files

### 🎯 **Precise File Targeting**
Scan exactly what matters with **granular file extension control**:
- **Technology-specific scanning**: Only scan `.java` files with Java rules, `.ts` files with TypeScript rules
- **Metadata inclusion**: Scan configuration files, XML metadata, and declarative definitions
- **Performance optimization**: Skip irrelevant files to reduce scan time
- **Flexible patterns**: Support for complex directory structures and file patterns

### 📋 **Beyond Code: Metadata Quality**
Quality isn't just about code—it's about your entire solution:
- **Salesforce metadata**: Validate any kind of metadata such as field definitions, flow configurations, permission sets, etc.
- **Configuration files**: Check XML schemas, JSON configurations, YAML pipelines
- **Documentation**: Ensure README files, API docs, and comments meet standards
- **Infrastructure as Code**: Validate Terraform, CloudFormation, and Kubernetes manifests

This holistic approach is especially valuable for **declarative platforms like Salesforce**, where business logic lives in metadata, flows, and configuration rather than just code.

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

<pre><code class="language-yaml">name: Full Project Code Quality Audit

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
</code></pre>

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

## PMD Ruleset Configuration

PMD supports many languages including Java, Apex, JavaScript, and XML. You can create custom XML ruleset files to define which rules to apply.

For complete rule documentation and configuration syntax, see:
- [PMD Rule Reference](https://pmd.github.io/pmd/pmd_rules_java.html) (Java)
- [PMD Apex Rules](https://pmd.github.io/pmd/pmd_rules_apex.html) (Salesforce Apex)
- [PMD Ruleset Configuration](https://pmd.github.io/pmd/pmd_userdocs_making_rulesets.html) (General ruleset syntax)

## ESLint Configuration

When using custom ESLint rulesets, you can create JavaScript configuration files to define which rules to apply.

### Standard JavaScript/TypeScript

<pre><code class="language-javascript">// eslint-rules/standard-ruleset.js
module.exports = {
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
    "no-unused-vars": "warn",
    "no-console": "warn",
    "no-eval": "error",
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",
  },
}
</code></pre>

## Salesforce ESLint

When using custom ESLint rulesets for Salesforce components, follow these configuration structures:

### Lightning Web Components (LWC)

<pre><code class="language-javascript">// eslint-rules/lwc-ruleset.js
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
</code></pre>

### Aura Components

<pre><code class="language-javascript">// eslint-rules/aura-ruleset.js
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
</code></pre>

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

### Salesforce ESLint Rules

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

<pre><code class="language-yaml">on:
  pull_request:
    types: [opened, reopened, synchronize]
    paths:
      - 'src/**'                    # Source code
      - '.eslintrc.*'               # ESLint config files
      - 'pmd-rules/**'              # PMD ruleset files
      - 'package.json'              # Dependencies
      - '.github/workflows/**'      # Workflow changes
</code></pre>

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

## Handling Workflow Failures and Conditional Steps

When `failOnQualityIssues` is set to `true` (the default), the action will fail the workflow step if violations exceed thresholds. However, you may still want to run conditional steps after the action fails. Here are the recommended patterns:

### Pattern 1: Continue After Failure (Recommended)

Use `if: always() && condition` to run steps even when the action fails:

\`\`\`yaml
- name: Run Code Quality Scan
  id: code-scan
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    failOnQualityIssues: true  # Action will fail if violations found
    # ... other inputs

# This step runs even if the action failed
- name: Check if action required
  if: always() && steps.code-scan.outputs.action-required == 'true'
  run: echo "Violations require developer action!"

# This step runs even if the action failed
- name: Upload reports
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: quality-reports
    path: code-quality-reports/
\`\`\`

### Pattern 2: Non-Blocking Quality Checks

Set `failOnQualityIssues: false` for informational scans that don't block the workflow:

\`\`\`yaml
- name: Run Code Quality Scan (Non-blocking)
  id: code-scan
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    failOnQualityIssues: false  # Never fail the workflow
    # ... other inputs

# These steps run normally since the action never fails
- name: Check if action required
  if: steps.code-scan.outputs.action-required == 'true'
  run: echo "Violations found but not blocking merge"
\`\`\`

### Pattern 3: Custom Failure Handling

Handle failures manually with explicit exit codes:

\`\`\`yaml
- name: Run Code Quality Scan
  id: code-scan
  uses: your-org/multi-code-scan-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    failOnQualityIssues: false  # Don't fail automatically
    # ... other inputs

# Custom logic to decide when to fail
- name: Evaluate and fail if needed
  if: always()
  run: |
    if [ "${{ steps.code-scan.outputs.action-required }}" == "true" ]; then
      echo "Quality gate failed - violations require action"
      exit 1
    else
      echo "Quality gate passed"
    fi
\`\`\`

### When to Use Each Pattern

| Pattern | Use Case | Workflow Behavior |
|---------|----------|-------------------|
| **Pattern 1** | Standard quality gates with post-processing | Fails on violations, runs cleanup steps |
| **Pattern 2** | Informational scans, legacy projects | Never fails, provides feedback only |
| **Pattern 3** | Complex conditional logic | Custom failure conditions |

## Severity Mapping and Priority Levels

This action standardizes severity levels across different analyzers. Understanding how tool-specific priorities map to our severity levels is crucial for setting appropriate thresholds.

### Our Standardized Severity Levels

| Severity | Description | Typical Use |
|----------|-------------|-------------|
| `critical` | Security vulnerabilities, major bugs | Block all deployments |
| `high` | Serious issues, performance problems | Block production deployments |
| `medium` | Code quality issues, maintainability | Allow with limits |
| `low` | Minor style issues, suggestions | Informational |
| `info` | Documentation, formatting | Informational |

### PMD Priority Mapping

PMD uses numeric priorities (1-5) which map to our severity levels:

| PMD Priority | Our Severity | Description | Examples |
|--------------|--------------|-------------|----------|
| 1 | `critical` | Critical issues that must be fixed | Security vulnerabilities, major bugs |
| 2 | `high` | Important issues | Performance problems, serious design flaws |
| 3 | `medium` | Moderate issues | Code quality, maintainability |
| 4 | `low` | Minor issues | Style violations, minor improvements |
| 5 | `info` | Informational | Documentation suggestions |

**Example PMD Rules by Priority:**
- **Priority 1 (Critical)**: SQL injection, hardcoded passwords, null pointer dereference
- **Priority 2 (High)**: Resource leaks, complex methods, security issues
- **Priority 3 (Medium)**: Unused variables, naming conventions, design patterns
- **Priority 4 (Low)**: Code formatting, comment styles
- **Priority 5 (Info)**: Documentation completeness, optional improvements

### ESLint Severity Mapping

ESLint uses numeric severities (0-2) which map to our severity levels:

| ESLint Severity | Our Severity | Description | Examples |
|-----------------|--------------|-------------|----------|
| 2 (error) | `high` | Must be fixed | Syntax errors, security issues, critical bugs |
| 1 (warn) | `medium` | Should be fixed | Code quality, best practices |
| 0 (off) | N/A | Rule disabled | Not reported |

**Note**: ESLint doesn't have a "critical" level, so we map errors to "high" severity.

**Example ESLint Rules by Severity:**
- **Error (High)**: `no-eval`, `no-debugger`, `no-unsafe-negation`
- **Warning (Medium)**: `no-console`, `no-unused-vars`, `prefer-const`

### Configuring Thresholds Based on Severity

Use these mappings to set appropriate thresholds:

\`\`\`yaml
# Strict configuration - no critical/high issues allowed
maxCriticalViolations: 0                     # No PMD Priority 1 issues
maxMediumViolations: 5                       # Limited PMD Priority 3 + ESLint warnings

# Moderate configuration - some high issues allowed in legacy code
maxCriticalViolations: 0                     # Still no critical issues
maxMediumViolations: 20                      # More tolerance for quality issues

# Legacy configuration - focus only on critical issues
maxCriticalViolations: 5                     # Some critical issues allowed
maxMediumViolations: 100                     # High tolerance for other issues
\`\`\`

### Differential Enforcement with Severity

Combine severity understanding with differential enforcement:

\`\`\`yaml
# New files: Zero tolerance
strictNewFiles: true                         # Any violation fails

# Modified files: Graduated tolerance
maxCriticalViolationsForModifiedFiles: 0     # No critical/high issues
maxViolationsForModifiedFiles: 10            # Limited total violations
\`\`\`

This approach ensures that:
- **Critical security issues** are never allowed
- **High-priority problems** are strictly controlled
- **Medium-priority issues** have reasonable limits
- **Low-priority items** don't block development

## License

MIT
