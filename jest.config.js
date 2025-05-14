module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: [
      "src/**/*.js",
      "!src/index.js", // We'll test this through integration tests
    ],
    coverageThreshold: {
      global: {
        branches: 20,
        functions: 20,
        lines: 20,
        statements: 20,
      },
    },
    testMatch: ["**/__tests__/**/*.test.js"],
    verbose: true,
  }
  