/**
 * Jest Configuration for GI Diary
 *
 * Testing Stack:
 * - Jest: Test runner and assertion library
 * - @testing-library/react-native: Component testing utilities
 * - jest-expo: Expo-specific Jest preset
 *
 * Coverage Target: 80% for critical paths (Epics 4, 5, 7)
 */

module.exports = {
  // Use Expo preset (includes React Native configuration)
  preset: 'jest-expo',

  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '@testing-library/jest-native/extend-expect',
  ],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
  ],

  // Coverage thresholds (enforce minimum coverage)
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
    // Critical paths require higher coverage
    './src/services/fuelPlanner.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/services/sessionRecovery.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/services/recommendations.ts': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },

  // Coverage report formats
  coverageReporters: ['text', 'lcov', 'html'],

  // Module path aliases (match tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',

    // Mock image imports
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '\\.snap$',
  ],

  // Transform ignore patterns (don't transform these node_modules)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|victory-native)',
  ],

  // Test environment
  testEnvironment: 'node',

  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },

  // Verbose output
  verbose: true,

  // Maximum number of concurrent workers
  maxWorkers: '50%',

  // Test timeout (5 seconds default)
  testTimeout: 5000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
