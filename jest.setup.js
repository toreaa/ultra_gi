/**
 * Jest Setup File
 *
 * Runs before each test suite to configure the testing environment
 */

import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(),
      runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
      getAllAsync: jest.fn(() => Promise.resolve([])),
    })
  ),
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    getFirstSync: jest.fn(() => null),
    getAllSync: jest.fn(() => []),
  })),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn(),
}));

// Mock expo-task-manager
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
  unregisterTaskAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-background-fetch
jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(() => Promise.resolve()),
  unregisterTaskAsync: jest.fn(() => Promise.resolve()),
  BackgroundFetchResult: {
    NewData: 1,
    NoData: 2,
    Failed: 3,
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const MockedModule = {
    ...RealModule,
    Portal: ({ children }) => children,
  };
  return MockedModule;
});

// Mock Victory Native (charts)
jest.mock('victory-native', () => ({
  VictoryChart: 'VictoryChart',
  VictoryLine: 'VictoryLine',
  VictoryScatter: 'VictoryScatter',
  VictoryAxis: 'VictoryAxis',
  VictoryLegend: 'VictoryLegend',
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Suppress console errors/warnings in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  // Keep log for debugging
  log: console.log,
};

// Mock timers (optional, uncomment if needed)
// jest.useFakeTimers();

// Set default timeout for all tests
jest.setTimeout(10000);
