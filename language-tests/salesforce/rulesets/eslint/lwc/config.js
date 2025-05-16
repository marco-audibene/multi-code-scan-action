/**
 * https://github.com/salesforce/eslint-plugin-lwc/tree/v2.2.0
 */
module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ["classProperties", ["decorators", { decoratorsBeforeExport: false }]],
      },
    },
  },

  plugins: ["@lwc/eslint-plugin-lwc"],
  rules: {
    "no-console": ["warn", { allow: ["error"] }],
    "no-eval": "error",
    "no-unused-vars": "error",
  },
}
