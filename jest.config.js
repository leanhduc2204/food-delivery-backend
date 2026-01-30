/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/__tests__/**",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  watchman: false,
};
