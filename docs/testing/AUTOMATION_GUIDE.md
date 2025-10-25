# Test Automation Guide - GI Diary

Complete guide to automated testing setup and execution for GI Diary.

---

## 📋 Overview

**Testing Stack:**
- **Jest:** Unit and integration tests
- **React Native Testing Library:** Component tests
- **Detox:** End-to-end tests on real devices/emulators
- **Coverage Target:** 80% for critical paths

**Test Files Created:** 3 example test suites
- `src/services/__tests__/fuelPlanner.test.ts` (Epic 4)
- `src/services/__tests__/sessionRecovery.test.ts` (Epic 5)
- `src/services/__tests__/recommendations.test.ts` (Epic 7)
- `e2e/epic4-planning.e2e.ts` (E2E)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Core testing dependencies
npm install --save-dev jest @types/jest
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest-expo
npm install --save-dev babel-jest

# Detox for E2E testing
npm install --save-dev detox
npm install --save-dev detox-cli

# Additional utilities
npm install --save-dev @testing-library/react-hooks
```

### 2. Setup Test Data

```bash
# Populate test database
npm run test-data:setup

# Verify test data
npm run test-data:inspect
```

### 3. Run Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests (requires emulator/device)
npm run e2e
```

---

## 🧪 Unit Testing (Jest)

### Configuration Files

**`jest.config.js`** - Main Jest configuration
- Preset: `jest-expo` (includes React Native setup)
- Coverage thresholds: 70% global, 90% for critical files
- Module name mapping for path aliases
- Transform ignore patterns for node_modules

**`jest.setup.js`** - Test environment setup
- Mocks for Expo modules (SQLite, Notifications, Task Manager)
- Mocks for React Native Paper, Victory Native
- Global test configuration

### Running Unit Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Test specific epic
npm run test:epic4  # Fuel planner
npm run test:epic5  # Session recovery
npm run test:epic7  # Recommendations

# Test specific file
npm test fuelPlanner.test.ts

# Update snapshots
npm run test:update-snapshots
```

### Test Structure

```typescript
describe('Feature Name (Epic X)', () => {
  describe('Test Scenario X.Y.Z: Description', () => {
    it('should do something specific', () => {
      // Given
      const input = setupTestData();

      // When
      const result = functionUnderTest(input);

      // Then
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Example: Testing Fuel Planner Algorithm

```typescript
// src/services/__tests__/fuelPlanner.test.ts
import { generateFuelPlan } from '../fuelPlanner';

describe('Test Scenario 4.2.1: Perfect Match', () => {
  it('should generate plan with exact match for 100g target', () => {
    // Given
    const targetCarbs = 100;
    const products = [{ name: 'Maurten Gel', carbs: 25 }];

    // When
    const plan = generateFuelPlan(targetCarbs, 120, products);

    // Then
    expect(plan.total_carbs).toBe(100);
    expect(plan.items[0].quantity).toBe(4);
  });
});
```

### Coverage Thresholds

**Global:** 70% (statements, branches, functions, lines)

**Critical Files (90% required):**
- `src/services/fuelPlanner.ts` (Epic 4 algorithm)
- `src/services/sessionRecovery.ts` (Epic 5 crash recovery)
- `src/services/recommendations.ts` (Epic 7 insights)

**View Coverage Report:**
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

---

## 🎯 Component Testing

### Testing Library Utilities

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

describe('IntakeButton Component', () => {
  it('should call onPress when tapped', () => {
    // Given
    const onPress = jest.fn();
    const { getByText } = render(<IntakeButton onPress={onPress} />);

    // When
    fireEvent.press(getByText('INNTAK'));

    // Then
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should display toast after logging intake', async () => {
    // Given
    const { getByText } = render(<ActiveSessionScreen />);

    // When
    fireEvent.press(getByText('INNTAK'));

    // Then
    await waitFor(() => {
      expect(getByText(/logget/i)).toBeTruthy();
    });
  });
});
```

### Best Practices

1. **Use accessible queries:** `getByText`, `getByRole`, `getByLabelText`
2. **Wait for async operations:** Use `waitFor` for state updates
3. **Mock navigation:** Test navigation calls without full stack
4. **Test user interactions:** Use `fireEvent` for taps, text input
5. **Snapshot sparingly:** Only for stable UI components

---

## 🔬 E2E Testing (Detox)

### Configuration

**`.detoxrc.js`** - Detox configuration
- Apps: Android debug/release, iOS debug/release
- Devices: Emulator, Simulator, Attached device
- Test runner: Jest with Detox environment

**`e2e/setup.ts`** - E2E test setup
- Launch app before tests
- Reload React Native before each test
- Grant permissions (notifications)

### Running E2E Tests

```bash
# Full E2E suite (build + test)
npm run e2e

# Build only
npm run e2e:build:android

# Test only (build must be done first)
npm run e2e:test:android

# Test on attached device
npm run e2e:test:android:device

# Specific test file
npm run e2e:epic4
```

### E2E Test Structure

```typescript
describe('Epic 4: Planning - Full Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full planning flow', async () => {
    // Navigate to planning
    await element(by.text('Programmer')).tap();
    await element(by.text('4-Week Base')).tap();

    // Wait for element
    await waitFor(element(by.text('Plan økt')))
      .toBeVisible()
      .withTimeout(5000);

    // Interact with UI
    await element(by.text('Plan økt')).tap();

    // Assert
    await expect(element(by.id('fuel-plan-container'))).toBeVisible();
  });
});
```

### Detox Matchers

```typescript
// Visibility
await expect(element(by.text('Text'))).toBeVisible();
await expect(element(by.text('Text'))).not.toBeVisible();

// Text content
await expect(element(by.id('timer'))).toHaveText('00:00:00');

// Existence
await expect(element(by.id('button'))).toExist();

// Wait for element
await waitFor(element(by.text('Text')))
  .toBeVisible()
  .withTimeout(5000);
```

### Device Actions

```typescript
// Reload app
await device.reloadReactNative();

// Launch with permissions
await device.launchApp({
  permissions: { notifications: 'YES' },
  newInstance: true,
});

// Terminate app
await device.terminateApp();

// Send to background
await device.sendToHome();

// Shake device (reload menu)
await device.shake();
```

---

## 📊 Test Coverage Analysis

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Report Structure

```
coverage/
├── lcov-report/
│   ├── index.html           # Main coverage page
│   ├── src/
│   │   ├── services/
│   │   │   ├── fuelPlanner.ts.html
│   │   │   ├── sessionRecovery.ts.html
│   │   │   └── recommendations.ts.html
│   └── ...
└── lcov.info                # Machine-readable format (for CI)
```

### Interpreting Coverage

**Coverage Metrics:**
- **Statements:** % of code statements executed
- **Branches:** % of if/else branches covered
- **Functions:** % of functions called
- **Lines:** % of code lines executed

**Color Coding:**
- 🟢 Green: ≥80% coverage (good)
- 🟡 Yellow: 50-79% coverage (needs improvement)
- 🔴 Red: <50% coverage (insufficient)

---

## 🛠️ Test Data Management

### Setup Test Data

```bash
# Create all test data (3 users, 8 products, 13 sessions)
npm run test-data:setup
```

**Creates:**
- Maria (ID: 1) - New user with active session
- Erik (ID: 2) - Active user with 4 completed sessions
- Kari (ID: 3) - Advanced user with 8 completed sessions

### Clear Test Data

```bash
# Remove all test data
npm run test-data:clear
```

### Inspect Test Data

```bash
# View current database state
npm run test-data:inspect
```

**Output:**
- User list
- Fuel products
- Session summary
- Active sessions (crash recovery)
- Data quality checks

### Reset Test Data

```bash
# Clear and recreate
npm run test-data:reset
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests with coverage
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Setup Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 31
          script: npm run e2e
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test
```

---

## 🐛 Debugging Tests

### Debug Failing Tests

```bash
# Run tests in debug mode
npm run test:debug

# Then in Chrome: chrome://inspect
# Click "Open dedicated DevTools for Node"
```

### Common Issues

#### 1. "Cannot find module" errors

**Solution:** Check `moduleNameMapper` in `jest.config.js`

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. "Transform" errors with node_modules

**Solution:** Add module to `transformIgnorePatterns`

```javascript
transformIgnorePatterns: [
  'node_modules/(?!(your-module|react-native)/)',
]
```

#### 3. Detox: "App is not installed"

**Solution:** Build app before testing

```bash
npm run e2e:build:android
npm run e2e:test:android
```

#### 4. Jest cache issues

**Solution:** Clear Jest cache

```bash
npm run test:clear-cache
```

---

## 📈 Performance Benchmarks

### Performance Test Pattern

```typescript
describe('Performance Benchmark', () => {
  it('should execute in less than 50ms', () => {
    const start = performance.now();

    // Function under test
    generateFuelPlan(100, 120, products);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // ms
  });
});
```

### Target Benchmarks

| Component | Target | Test Scenario |
|-----------|--------|---------------|
| Fuel planner algorithm | <50ms | 4.P.1 |
| Database write | <50ms | 5.P.1 |
| UI responsiveness | <100ms | 4.P.2, 5.P.2 |
| Recommendations | <100ms | 7.P.2 |
| Chart rendering | <2s | 7.P.1 |

---

## 📚 Best Practices

### 1. Test Organization

✅ **DO:**
- Group tests by feature/epic
- Use descriptive test names
- Follow Given-When-Then pattern
- One assertion per test (ideally)

❌ **DON'T:**
- Mix unit and E2E tests
- Test implementation details
- Write flaky tests
- Skip edge cases

### 2. Mocking Strategy

✅ **Mock:**
- External dependencies (API calls, database)
- Expo modules (SQLite, Notifications)
- Navigation
- Time-dependent functions

❌ **Don't Mock:**
- Code you're testing
- Pure functions (unless slow)
- Simple utilities

### 3. Test Data

✅ **DO:**
- Use realistic test data
- Reset state between tests
- Use factory functions for data creation
- Keep test data in separate files

❌ **DON'T:**
- Use production data in tests
- Share mutable state between tests
- Hard-code magic numbers
- Use random data (non-deterministic)

### 4. Assertions

✅ **Good Assertions:**
```typescript
expect(plan.total_carbs).toBe(100); // Specific
expect(plan.items).toHaveLength(4); // Clear
expect(recommendations[0].type).toBe('product_success'); // Exact
```

❌ **Bad Assertions:**
```typescript
expect(plan).toBeTruthy(); // Too vague
expect(result).toMatchSnapshot(); // Brittle
expect(data.length).toBeGreaterThan(0); // Not specific
```

---

## 🎯 Test Priority Matrix

### High Priority (Automate First - 60%)

**Epic 4:**
- ✅ Algorithm validation (4.2.1 - 4.2.8)
- ✅ Timing calculation (4.2.5)
- ✅ Performance benchmarks (4.P.1)

**Epic 5:**
- ✅ Core functionality (5.1.1, 5.3.1, 5.4.1, 5.5.1)
- ✅ Crash recovery logic (5.CR.1, 5.CR.6, 5.CR.7)
- ✅ Database writes and integrity

**Epic 7:**
- ✅ Query validation (7.6.4, 7.7.6)
- ✅ Recommendation algorithm (7.4.2 - 7.4.5)
- ✅ Aggregation calculations (7.3.6)

### Medium Priority (E2E - 25%)

- Integration flows (4.I.1, 5.I.1, 7.I.1)
- Navigation testing
- State persistence

### Low Priority (Manual - 15%)

- UI/UX validation
- Chart visualization
- Background timer (4-hour POC)
- Notification delivery

---

## 📖 Additional Resources

### Documentation
- `docs/testing/README.md` - Master testing guide
- `docs/testing/epic-4-test-scenarios.md` - Epic 4 scenarios
- `docs/testing/epic-5-test-scenarios.md` - Epic 5 scenarios
- `docs/testing/epic-7-test-scenarios.md` - Epic 7 scenarios

### Test Data
- `scripts/README.md` - Test data documentation
- `scripts/setupTestData.ts` - Data population
- `scripts/inspectTestData.ts` - Data verification

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [jest-expo](https://docs.expo.dev/develop/unit-testing/)

---

## 🏁 Next Steps

### 1. Complete Setup (Week 1)
- [ ] Install all dependencies
- [ ] Run `npm run test-data:setup`
- [ ] Verify tests run: `npm test`
- [ ] Setup Android emulator for Detox

### 2. Implement Tests (Week 2-3)
- [ ] Write unit tests for Epic 1-3 (CRUD operations)
- [ ] Complete Epic 4 algorithm tests
- [ ] Complete Epic 5 crash recovery tests
- [ ] Complete Epic 7 recommendation tests

### 3. E2E Tests (Week 4)
- [ ] Full planning flow (Epic 4)
- [ ] Session lifecycle (Epic 5)
- [ ] Analysis navigation (Epic 7)

### 4. CI/CD Integration (Week 5)
- [ ] Setup GitHub Actions workflow
- [ ] Configure coverage reporting (Codecov)
- [ ] Add pre-commit hooks (Husky)
- [ ] Document for team

---

**Created by:** Quinn (QA) 🎯
**Last Updated:** 2025-10-24
**Version:** 1.0

_"Automated testing is not a luxury - it's a necessity for maintaining quality at speed."_

_— Quinn, Senior QA Engineer_
