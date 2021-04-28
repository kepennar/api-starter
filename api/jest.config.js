module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
  testEnvironment: "node",
  coverageDirectory: "coverage",
  testMatch: ["**/*/*.spec.ts"],
  moduleFileExtensions: ["js", "ts"],
  moduleDirectories: ["node_modules"],
};
