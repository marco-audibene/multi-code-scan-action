/**
 * TypeScript ESLint Configuration (Legacy Format)
 * Using basic ESLint rules without any package imports
 */
module.exports = {
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    globals: {
      browser: true,
      es2021: true,
      node: true,
    },
  },
  rules: {
    // Basic ESLint rules (manually specified)
    "no-console": "warn",
    "no-eval": "error",
    "no-alert": "error",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",
    "no-unused-vars": "off", // Disabled for TypeScript
    "no-undef": "off", // Disabled for TypeScript
  },
}
