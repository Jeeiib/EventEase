module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/jest.global-setup.js',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
