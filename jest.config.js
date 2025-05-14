module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: [
      "src/**/*.js",
      "!src/index.js", // We'll test this through integration tests
    ],
    coverageThreshold: {
      global: {
        branches: 15,
        functions: 15,
        lines: 15,
        statements: 15,
      },
    },
    testMatch: ["**/__tests__/**/*.test.js"],
    verbose: true,
  }
  