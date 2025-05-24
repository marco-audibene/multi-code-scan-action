/**
 * Simplified TypeScript ESLint ruleset for testing (FLAT CONFIG FORMAT)
 * Uses basic ESLint rules that work with TypeScript files
 */
module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        // Node globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      // Basic ESLint rules that work with TypeScript files
      "no-console": "warn",
      "no-eval": "error",
      "no-unused-vars": "error",
      "no-undef": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: "error",
      "no-alert": "error",
      "no-debugger": "error",
    },
  },
]
