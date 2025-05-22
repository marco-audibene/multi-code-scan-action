/**
 * https://github.com/salesforce/eslint-plugin-aura/tree/master
 */
module.exports = {
    parser: "@babel/eslint-parser",
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2018,
      sourceType: "script",
    },
    plugins: ["@salesforce/eslint-plugin-aura"],
    rules: {
      "no-console": ["warn", { allow: ["error"] }],
      "no-eval": "error",
      "no-alert": "error",
      "no-unused-vars": "error",
      "@salesforce/aura/no-deprecated-component": "error",
      "@salesforce/aura/no-js-in-markup": "error",
    },
  }
  