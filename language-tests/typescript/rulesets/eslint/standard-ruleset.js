/**
 * TypeScript ESLint Configuration (Flat Config Format - No TypeScript packages)
 * Using basic ESLint rules without TypeScript-specific parser or plugin
 */
import js from "@eslint/js"

export default {
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
    // Include base ESLint recommended rules
    ...js.configs.recommended.rules,

    // Basic ESLint rules
    "no-console": "warn",
    "no-eval": "error",
    "no-alert": "error",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",

    // Disable rules that might not work well with TypeScript syntax
    "no-unused-vars": "off",
    "no-undef": "off",
  },
}
