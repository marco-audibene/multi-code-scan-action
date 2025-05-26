# Language Tests

This directory contains test files and rulesets for various languages and technologies.

## Structure

Each language or technology has its own subdirectory with the following structure:

<pre><code>language-tests/
├── [technology-name]/
│   ├── files/
│   │   └── [file-type]/
│   │       └── [test files with intentional violations]
│   └── rulesets/
│       └── [analyzer]/
│           └── [ruleset files]
</code></pre>

## Available Tests

- `salesforce/` - Test files and rulesets for Salesforce technologies (Apex, LWC, Aura)

## Adding New Tests

To add tests for a new language or technology:

1. Create a new directory under `language-tests/`
2. Add subdirectories for `files/` and `rulesets/`
3. Add test files with intentional violations
4. Add custom rulesets for the analyzers
5. Create a workflow file in `.github/workflows/` to run the tests
