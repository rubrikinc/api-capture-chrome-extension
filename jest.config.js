
module.exports = {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
    "moduleNameMapper": {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
      },
      collectCoverage: true,
      coverageDirectory: 'coverage',
      coverageReporters: ['lcov', 'text']
}
