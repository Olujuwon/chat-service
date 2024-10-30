module.exports = {
    clearMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/singleton.ts'],
    verbose: true,
    testMatch: ['**/?(*.)+(spec|test).ts'],
    collectCoverage: false,
    reporters: ['default', 'summary'],
};
