/**
 * Detox E2E Test Setup
 *
 * Runs before each E2E test suite
 */

import { device } from 'detox';

beforeAll(async () => {
  // Launch app before all tests
  await device.launchApp({
    permissions: {
      notifications: 'YES',
    },
    newInstance: true,
  });
});

beforeEach(async () => {
  // Reload app before each test to reset state
  await device.reloadReactNative();
});

afterAll(async () => {
  // Cleanup after all tests
  await device.terminateApp();
});
