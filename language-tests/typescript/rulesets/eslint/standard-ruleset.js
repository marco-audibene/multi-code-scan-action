/**
 * TypeScript ESLint Configuration (Legacy Format)
 * https://typescript-eslint.io/getting-started
 */
module.exports = {
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
  rules: {
    // Basic ESLint rules
    "no-console": "warn",
    "no-eval": "error",
    "no-alert": "error",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",

    // TypeScript-specific rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/ban-types": "error",
  },
}
