/**
 * TypeScript ESLint Configuration (Flat Config Format - Minimal)
 * Using just the parser without TypeScript-specific plugin
 */
import typescriptParser from "@typescript-eslint/parser"
import js from "@eslint/js"

export default {
  languageOptions: {
    parser: typescriptParser,
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

    // Basic ESLint rules that work well with TypeScript
    "no-console": "warn",
    "no-eval": "error",
    "no-alert": "error",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",

    // Disable rules that don't work well with TypeScript
    "no-unused-vars": "off", // TypeScript compiler handles this
    "no-undef": "off", // TypeScript compiler handles this
  },
}
