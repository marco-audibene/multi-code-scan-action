# TypeScript Tests

This directory contains test files and rulesets for TypeScript development.

## Structure

<pre><code>typescript/
├── files/
│   ├── src/
│   │   ├── basic.ts
│   │   ├── advanced.ts
│   │   └── utils.ts
│   └── components/
│       ├── Button.tsx
│       └── Form.tsx
└── rulesets/
    └── eslint/
        └── standard-ruleset.js
</code></pre>

## Test Files

The test files contain intentional code quality issues that should be detected by the action:

### TypeScript Files (src/)
- `basic.ts`: Contains basic TypeScript violations (unused variables, any types, missing return types)
- `advanced.ts`: Contains more complex violations (async/await issues, type assertions)
- `utils.ts`: Contains utility function violations (console.log, eval usage)

### TypeScript React Files (components/)
- `Button.tsx`: Contains React component violations (unused props, missing key props)
- `Form.tsx`: Contains form handling violations (uncontrolled inputs, missing validation)

## Rulesets

### ESLint Rulesets
- `standard-ruleset.js`: Custom TypeScript rules that extend @typescript-eslint/recommended

## Running Tests

These tests are run using the `typescript-code-quality-test.yml` workflow, which executes the multi-code-scan-action against these test files using the provided rulesets.

The action should detect the intentional violations in each file type and report them as annotations in GitHub.
