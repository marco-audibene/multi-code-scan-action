/**
 * https://github.com/salesforce/eslint-plugin-lwc/tree/master/docs/rules
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
    "@lwc/lwc/no-async-operation": "error", // Added rule for no setTimeout/setInterval
  },
}
