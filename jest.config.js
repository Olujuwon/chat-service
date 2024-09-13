module.exports = {
    clearMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/singleton.ts'],
    verbose: false,
    testMatch: ['**/?(*.)+(spec|test).ts'],
    collectCoverage: true,
    reporters: ['summary'],
};
