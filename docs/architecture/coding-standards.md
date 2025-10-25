# Coding Standards - GI Diary

**Version:** 1.0
**Last Updated:** 2025-10-23

---

## Overview

This document defines coding standards and best practices for the GI Diary project. Following these guidelines ensures consistency, maintainability, and effective AI-assisted development.

---

## General Principles

1. **Clarity over Cleverness** - Write code that's easy to understand
2. **Consistent Style** - Use ESLint + Prettier (auto-formatted)
3. **Type Safety** - Leverage TypeScript fully, avoid `any`
4. **Functional Approach** - Prefer pure functions and immutability
5. **Test Important Logic** - Unit test calculations, business logic

---

## TypeScript

### **Type Definitions**

✅ **DO:**
```typescript
// Explicit types for function parameters and returns
function calculateCarbRate(totalCarbs: number, durationMinutes: number): number {
  return (totalCarbs / durationMinutes) * 60;
}

// Use interfaces for object shapes
interface FuelProduct {
  id: number;
  name: string;
  carbs_per_serving: number;
}

// Use type aliases for unions
type SessionStatus = 'active' | 'completed' | 'abandoned';
```

❌ **DON'T:**
```typescript
// Avoid 'any'
function processData(data: any) { ... }  // BAD

// Don't skip return types
function calculate(x: number, y: number) {  // BAD - missing return type
  return x + y;
}
```

### **Null Safety**

✅ **DO:**
```typescript
// Use optional chaining
const userName = user?.profile?.name ?? 'Unknown';

// Explicit null checks
if (session === null || session === undefined) {
  return;
}

// Use non-null assertion only when certain
const db = await getDatabase()!; // Only if guaranteed to exist
```

### **Generics**

```typescript
// Repository pattern with generics
class Repository<T> {
  async findById(id: number): Promise<T | null> {
    // ...
  }
}

const fuelRepo = new Repository<FuelProduct>();
```

---

## React Native Components

### **Functional Components**

✅ **DO:**
```typescript
// Use FC (FunctionComponent) with props interface
import React, { FC } from 'react';

interface FuelCardProps {
  product: FuelProduct;
  onPress: (id: number) => void;
}

export const FuelCard: FC<FuelCardProps> = ({ product, onPress }) => {
  return (
    <Card onPress={() => onPress(product.id)}>
      <Card.Title title={product.name} />
      <Card.Content>
        <Text>{product.carbs_per_serving}g carbs</Text>
      </Card.Content>
    </Card>
  );
};
```

❌ **DON'T:**
```typescript
// Avoid default exports for components (harder to refactor)
export default function FuelCard(props) { ... }  // BAD

// Don't use class components (unnecessary)
class FuelCard extends Component { ... }  // BAD (functional is preferred)
```

### **Component File Structure**

```typescript
// 1. Imports (grouped)
import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useFuelProducts } from '@hooks/useFuelProducts';
import { FuelProduct } from '@types/database';

// 2. Types/Interfaces
interface FuelListProps {
  userId: number;
  onSelect: (product: FuelProduct) => void;
}

// 3. Component
export const FuelList: FC<FuelListProps> = ({ userId, onSelect }) => {
  const { products, loading } = useFuelProducts(userId);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {products.map((p) => (
        <FuelCard key={p.id} product={p} onPress={() => onSelect(p)} />
      ))}
    </View>
  );
};

// 4. Styles (at bottom)
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

---

## Hooks

### **Custom Hooks**

✅ **DO:**
```typescript
// Prefix with 'use'
export function useFuelProducts(userId: number) {
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [userId]);

  const loadProducts = async () => {
    setLoading(true);
    const data = await FuelProductRepository.getAll(userId);
    setProducts(data);
    setLoading(false);
  };

  return { products, loading, refresh: loadProducts };
}
```

### **useEffect Dependencies**

✅ **DO:**
```typescript
// Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]); // ✅ Correct

// Use useCallback for function deps
const handleSubmit = useCallback(() => {
  saveData(formData);
}, [formData]);
```

❌ **DON'T:**
```typescript
// Don't omit dependencies (causes bugs)
useEffect(() => {
  fetchData(userId);
}, []); // ❌ Missing userId dependency
```

---

## State Management (Zustand)

### **Store Definition**

```typescript
// src/store/sessionStore.ts
import { create } from 'zustand';

interface SessionState {
  activeSession: SessionLog | null;
  isRunning: boolean;

  // Actions
  startSession: (plannedSessionId?: number) => Promise<void>;
  endSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  isRunning: false,

  startSession: async (plannedSessionId) => {
    const session = await SessionRepository.create({ plannedSessionId });
    set({ activeSession: session, isRunning: true });
  },

  endSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    await SessionRepository.update(activeSession.id, { ended_at: new Date().toISOString() });
    set({ activeSession: null, isRunning: false });
  },
}));
```

### **Usage in Components**

```typescript
// Use selectors to avoid unnecessary re-renders
const isRunning = useSessionStore((state) => state.isRunning);
const startSession = useSessionStore((state) => state.startSession);

// Don't subscribe to entire store (causes extra renders)
const store = useSessionStore(); // ❌ BAD (re-renders on any state change)
```

---

## Database Access

### **Repository Pattern**

✅ **DO:**
```typescript
// src/database/repositories/FuelProductRepository.ts
import { getDatabase } from '../index';
import { FuelProduct } from '@types/database';

export class FuelProductRepository {
  static async getAll(userId: number): Promise<FuelProduct[]> {
    const db = await getDatabase();
    return db.getAllAsync<FuelProduct>(
      'SELECT * FROM fuel_products WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );
  }

  static async create(product: Omit<FuelProduct, 'id' | 'created_at'>): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO fuel_products (user_id, name, product_type, carbs_per_serving) VALUES (?, ?, ?, ?)',
      [product.user_id, product.name, product.product_type, product.carbs_per_serving]
    );
    return result.lastInsertRowId;
  }
}
```

### **SQL Queries**

✅ **DO:**
```typescript
// Use parameterized queries (prevents SQL injection)
await db.runAsync(
  'INSERT INTO fuel_products (name, carbs) VALUES (?, ?)',
  [productName, carbs]
);

// Use transactions for multiple writes
await db.execAsync('BEGIN TRANSACTION');
try {
  await db.runAsync('INSERT INTO ...');
  await db.runAsync('UPDATE ...');
  await db.execAsync('COMMIT');
} catch (error) {
  await db.execAsync('ROLLBACK');
  throw error;
}
```

❌ **DON'T:**
```typescript
// NEVER concatenate user input into SQL
await db.runAsync(`INSERT INTO fuel_products (name) VALUES ('${productName}')`); // ❌ SQL INJECTION RISK
```

---

## Styling

### **StyleSheet vs. Inline Styles**

✅ **DO:**
```typescript
// Use StyleSheet.create (performance optimized)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

❌ **DON'T:**
```typescript
// Avoid inline styles (creates new object on every render)
<View style={{ flex: 1, padding: 16 }}>  // ❌ BAD
```

### **Conditional Styles**

```typescript
// Use array syntax for conditional styles
<View style={[
  styles.card,
  isActive && styles.cardActive,
  { marginTop: spacing }, // Dynamic values OK
]}>
```

---

## Error Handling

### **Async Operations**

✅ **DO:**
```typescript
async function loadData() {
  try {
    setLoading(true);
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
}
```

### **User-Facing Errors**

```typescript
// Show user-friendly messages
try {
  await saveSession();
} catch (error) {
  Alert.alert(
    'Save Failed',
    'Could not save your session. Please try again.',
    [{ text: 'OK' }]
  );
}
```

---

## Naming Conventions

### **Files**

- **Components/Screens:** PascalCase - `FuelProductCard.tsx`
- **Utilities/Services:** camelCase - `fuelPlanner.ts`
- **Hooks:** camelCase with `use` prefix - `useFuelProducts.ts`
- **Types:** camelCase - `database.ts`
- **Constants:** PascalCase - `HeartRateZones.ts`

### **Variables & Functions**

```typescript
// Variables: camelCase
const userName = 'John';
const isActive = true;

// Functions: camelCase (verbs)
function calculateTotal() { ... }
function handlePress() { ... }

// Components: PascalCase (nouns)
const FuelCard = () => { ... };

// Constants: SCREAMING_SNAKE_CASE
const MAX_CARBS_PER_HOUR = 120;
const API_BASE_URL = 'https://api.strava.com';
```

### **Boolean Naming**

```typescript
// Prefix with is/has/should/can
const isLoading = true;
const hasError = false;
const shouldRefresh = true;
const canSubmit = false;
```

---

## Comments

### **When to Comment**

✅ **DO:**
```typescript
// Explain WHY, not WHAT (code should be self-documenting)

// Calculate carb rate based on Jeukendrup (2014) protocol:
// Maximum absorption rate is ~90g/hr for trained athletes
const maxCarbRate = Math.min(calculatedRate, 90);

// TODO: Add support for custom programs (Epic X)
// FIXME: Timer drift after 2+ hours (investigate background task)
```

❌ **DON'T:**
```typescript
// Don't comment obvious code
let i = 0; // Set i to 0  ❌ UNNECESSARY

// Don't leave commented-out code
// const oldFunction = () => { ... }  ❌ DELETE IT (use git history)
```

### **JSDoc for Complex Functions**

```typescript
/**
 * Generates a fuel plan based on target carb rate and available products.
 *
 * @param targetGPerHour - Desired carbohydrate intake rate (e.g., 60)
 * @param durationMinutes - Session duration (e.g., 120)
 * @param availableProducts - User's fuel library
 * @returns Optimized fuel plan with timing
 */
export function generateFuelPlan(
  targetGPerHour: number,
  durationMinutes: number,
  availableProducts: FuelProduct[]
): FuelPlan {
  // Implementation...
}
```

---

## Testing

### **Unit Tests (Jest)**

```typescript
// FuelCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { FuelCard } from './FuelCard';

describe('FuelCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Maurten Gel',
    carbs_per_serving: 25,
  };

  it('displays product name and carbs', () => {
    const { getByText } = render(<FuelCard product={mockProduct} onPress={jest.fn()} />);
    expect(getByText('Maurten Gel')).toBeTruthy();
    expect(getByText('25g carbs')).toBeTruthy();
  });

  it('calls onPress with product id', () => {
    const onPress = jest.fn();
    const { getByText } = render(<FuelCard product={mockProduct} onPress={onPress} />);

    fireEvent.press(getByText('Maurten Gel'));
    expect(onPress).toHaveBeenCalledWith(1);
  });
});
```

### **Business Logic Tests**

```typescript
// calculations.test.ts
import { calculateCarbRate } from './calculations';

describe('calculateCarbRate', () => {
  it('calculates correct g/hr for 60 min session', () => {
    expect(calculateCarbRate(60, 60)).toBe(60);
  });

  it('calculates correct g/hr for 120 min session', () => {
    expect(calculateCarbRate(90, 120)).toBe(45);
  });
});
```

---

## Git Commit Messages

### **Format**

```
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `style`: Formatting, missing semicolons, etc.
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `chore`: Maintenance (dependencies, config)

### **Examples**

```
feat(fuel): Add fuel product CRUD operations

Implements Epic 2 - Fuel Library
- Add FuelProductRepository
- Create FuelLibraryScreen
- Add validation for carb input

Closes #12
```

```
fix(session): Timer drift after background mode

Timer was losing accuracy when app backgrounded.
Now using expo-task-manager to maintain accuracy.

Fixes #45
```

---

## Performance Best Practices

### **React Optimization**

```typescript
// Use React.memo for expensive components
export const SessionChart = React.memo(({ data }) => {
  return <VictoryChart>...</VictoryChart>;
});

// Use useCallback for event handlers passed to children
const handlePress = useCallback(() => {
  onProductSelect(product.id);
}, [product.id, onProductSelect]);

// Use useMemo for expensive calculations
const chartData = useMemo(() => {
  return processTimeseriesData(rawData);
}, [rawData]);
```

### **Database Performance**

```typescript
// Batch inserts instead of individual
await db.execAsync('BEGIN TRANSACTION');
for (const event of events) {
  await db.runAsync('INSERT INTO session_events ...', [...]);
}
await db.execAsync('COMMIT');

// Create indexes for frequent queries
CREATE INDEX idx_session_events_time ON session_events(session_log_id, timestamp_offset_seconds);
```

---

## Security

### **Sensitive Data**

```typescript
// Store OAuth tokens in SecureStore (encrypted)
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('strava_token', accessToken);
const token = await SecureStore.getItemAsync('strava_token');

// NEVER store in AsyncStorage (plaintext)
await AsyncStorage.setItem('strava_token', token); // ❌ INSECURE
```

### **Environment Variables**

```typescript
// Use expo-constants for config
import Constants from 'expo-constants';

const stravaClientId = Constants.expoConfig?.extra?.stravaClientId;

// NEVER commit secrets to git
const API_KEY = 'sk_live_12345'; // ❌ BAD - use .env
```

---

## Accessibility

```typescript
// Add accessibility labels
<Button
  accessibilityLabel="Log carbohydrate intake"
  accessibilityHint="Records the time and product consumed"
>
  Log Intake
</Button>

// Use accessible colors (WCAG AA contrast)
const styles = StyleSheet.create({
  errorText: {
    color: '#D32F2F', // ✅ 4.5:1 contrast on white
  },
});
```

---

## Code Review Checklist

Before submitting code:

- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Formatted with Prettier
- [ ] No console.log statements (use logger utility)
- [ ] No commented-out code
- [ ] Tests added for new features
- [ ] Documentation updated (if needed)
- [ ] No sensitive data hardcoded

---

## Tools Configuration

### **ESLint (.eslintrc.js)**

```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['react', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

### **Prettier (.prettierrc)**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Resources

- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Documentation](https://docs.expo.dev/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-23 | Initial coding standards |
