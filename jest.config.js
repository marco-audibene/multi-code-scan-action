module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: [
      "src/**/*.js",
      "!src/index.js", // We'll test this through integration tests
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    testMatch: ["**/__tests__/**/*.test.js"],
    verbose: true,
  }
  