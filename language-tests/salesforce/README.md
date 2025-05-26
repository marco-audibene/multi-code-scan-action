# Salesforce Tests

This directory contains test files and rulesets for Salesforce technologies.

## Structure

<pre><code>salesforce/
├── files/
│   ├── classes/
│   │   ├── TestController.cls
│   │   └── TestController.cls-meta.xml
│   ├── lwc/
│   │   ├── testComponent/
│   │   │   ├── testComponent.js
│   │   │   ├── testComponent.html
│   │   │   └── testComponent.js-meta.xml
│   ├── aura/
│   │   └── testAuraComponent/
│   │       ├── testAuraComponent.cmp
│   │       ├── testAuraComponent.cmp-meta.xml
│   │       └── testAuraComponentController.js
│   └── objects/
│       └── TestObject__c/
│           ├── TestObject__c.object-meta.xml
│           └── fields/
│               └── TestField__c.field-meta.xml
└── rulesets/
    ├── pmd/
    │   ├── apex/
    │   │   └── ruleset.xml
    │   └── xml/
    │       └── field-ruleset.xml
    └── eslint/
        ├── lwc/
        │   └── standard-ruleset.js
        └── aura/
            └── standard-ruleset.js
</code></pre>

## Test Files

The test files contain intentional code quality issues that should be detected by the action:

### Apex Classes
- `TestController.cls`: Contains SOQL in a loop and unused variables

### Lightning Web Components (LWC)
- `testComponent.js`: Contains console.log statements and eval usage

### Aura Components
- `testAuraComponentController.js`: Contains console.log statements, eval usage, and alert usage

### Salesforce Metadata
- `TestField__c.field-meta.xml`: Missing field description

## Rulesets

### PMD Rulesets
- `apex/ruleset.xml`: Standard rules for Apex code quality
- `xml/field-ruleset.xml`: Rules for validating field metadata (checks for missing descriptions)

### ESLint Rulesets
- `lwc/standard-ruleset.js`: Standard rules for Lightning Web Components
- `aura/standard-ruleset.js`: Standard rules for Aura Components

## Running Tests

These tests are run using the `salesforce-code-quality-test.yml` workflow, which executes the multi-code-scan-action against these test files using the provided rulesets.

The action should detect the intentional violations in each file type and report them as annotations in GitHub.
