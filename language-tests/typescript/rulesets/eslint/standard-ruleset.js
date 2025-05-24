/**
 * TypeScript ESLint ruleset using simple legacy format
 * Based on official typescript-eslint documentation
 */
module.exports = {
  extends: ["eslint:recommended"],
  rules: {
    // Basic ESLint rules
    "no-console": "warn",
    "no-eval": "error",
    "no-alert": "error",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",

    // Disable base rules that have TypeScript equivalents
    "no-unused-vars": "off",
    "no-undef": "off",

    // TypeScript-specific rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/prefer-readonly": "warn",
  },
}
