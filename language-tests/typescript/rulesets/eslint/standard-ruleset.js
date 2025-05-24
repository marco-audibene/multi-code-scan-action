/**
 * TypeScript ESLint ruleset using proper @typescript-eslint rules
 * Works with both ESLint and TypeScript-specific analysis
 */
module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": "@typescript-eslint/eslint-plugin",
    },
    rules: {
      // Basic ESLint rules that work for both JS and TS
      "no-console": "warn",
      "no-eval": "error",
      "no-alert": "error",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: "error",

      // Disable ESLint rules that have TypeScript equivalents
      "no-unused-vars": "off",
      "no-undef": "off", // TypeScript handles this

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
  },
]
