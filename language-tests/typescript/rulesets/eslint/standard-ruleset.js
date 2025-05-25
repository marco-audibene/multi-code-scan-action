/**
 * TypeScript ESLint Configuration (Flat Config Format)
 * https://typescript-eslint.io/getting-started
 * https://eslint.org/docs/latest/use/configure/migration-guide#custom-parsers
 */
import typescriptEslint from "@typescript-eslint/eslint-plugin"
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
  plugins: {
    "@typescript-eslint": typescriptEslint,
  },
  rules: {
    // Include base ESLint recommended rules
    ...js.configs.recommended.rules,

    // Include TypeScript ESLint recommended rules
    ...typescriptEslint.configs.recommended.rules,

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
