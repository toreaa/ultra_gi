# Source Tree Structure - GI Diary

**Version:** 1.0
**Last Updated:** 2025-10-23
**Framework:** React Native (Expo Managed Workflow)

---

## Overview

This document defines the project directory structure and organization for the GI Diary mobile application. The structure follows React Native and Expo best practices, optimized for AI-assisted development and rapid iteration.

---

## Root Directory Structure

```
ultra_gi/
├── app/                          # Expo Router (file-based routing)
├── src/                          # Application source code
│   ├── components/               # Reusable React components
│   ├── screens/                  # Screen-level components
│   ├── navigation/               # Navigation configuration (if not using Expo Router)
│   ├── services/                 # Business logic & API services
│   ├── database/                 # Database access layer
│   ├── store/                    # State management (Zustand)
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── constants/                # App constants & configuration
│   ├── types/                    # TypeScript type definitions
│   └── theme/                    # Theming & styling
├── assets/                       # Static assets (images, fonts, etc.)
├── migrations/                   # Database migration scripts
├── docs/                         # Documentation (architecture, PRD, etc.)
├── .expo/                        # Expo build artifacts (gitignored)
├── node_modules/                 # Dependencies (gitignored)
├── app.json                      # Expo configuration
├── package.json                  # NPM dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── eas.json                      # EAS Build configuration
├── .gitignore                    # Git ignore rules
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Example env vars (committed)
└── README.md                     # Project readme
```

---

## Detailed Structure

### **`/app` - Expo Router (Recommended for v2)**

> Note: For MVP, we'll use React Navigation in `/src/navigation`. Expo Router can be adopted in v1.1.

```
app/
├── (tabs)/                       # Tab-based navigation
│   ├── index.tsx                 # Home/Dashboard tab
│   ├── skafferi.tsx              # Fuel library tab
│   ├── programs.tsx              # Programs tab
│   └── profile.tsx               # User profile tab
├── session/                      # Session-related screens
│   ├── [id].tsx                  # Session detail (dynamic route)
│   ├── plan.tsx                  # Session planning
│   └── active.tsx                # Økt-modus (active session)
├── onboarding/                   # Onboarding flow
│   ├── index.tsx                 # Welcome screen
│   ├── goals.tsx                 # Goal selection
│   └── program.tsx               # Program recommendation
├── _layout.tsx                   # Root layout (stack navigator)
└── +not-found.tsx                # 404 screen
```

---

### **`/src/components` - Reusable Components**

```
src/components/
├── ui/                           # Generic UI components
│   ├── Button.tsx                # Custom button (wraps Paper Button)
│   ├── Card.tsx                  # Content cards
│   ├── Input.tsx                 # Form inputs
│   ├── Chip.tsx                  # Chips/tags
│   └── LoadingSpinner.tsx        # Loading indicator
├── fuel/                         # Fuel-related components
│   ├── FuelProductCard.tsx       # Display fuel product
│   ├── FuelProductForm.tsx       # Add/edit fuel product
│   └── FuelSelector.tsx          # Multi-select fuel picker
├── session/                      # Session-related components
│   ├── SessionTimer.tsx          # Timer UI for Økt-modus
│   ├── IntakeButton.tsx          # Large intake logging button
│   ├── DiscomfortButton.tsx      # Large discomfort logging button
│   └── SessionEventList.tsx      # List of logged events
├── charts/                       # Chart components
│   ├── HeartRateChart.tsx        # Victory Native line chart
│   ├── ElevationChart.tsx        # Elevation profile
│   └── SessionTimeline.tsx       # Annotated timeline (events + HR)
├── program/                      # Program-related components
│   ├── ProgramCard.tsx           # Program overview card
│   ├── ProgramWeekView.tsx       # Week-level program view
│   └── SessionCard.tsx           # Single session in program
└── common/                       # Common components
    ├── Header.tsx                # Screen header
    ├── EmptyState.tsx            # Empty state placeholder
    └── ErrorBoundary.tsx         # Error handling wrapper
```

---

### **`/src/screens` - Screen Components**

```
src/screens/
├── onboarding/
│   ├── WelcomeScreen.tsx         # Epic 1.1: Welcome wizard
│   ├── GoalsScreen.tsx           # Epic 1.1: Goal/issue selection
│   └── ProgramSuggestionScreen.tsx # Epic 1.2: Suggested program
├── home/
│   └── DashboardScreen.tsx       # Main dashboard (upcoming sessions)
├── fuel/
│   ├── FuelLibraryScreen.tsx     # Epic 2: "Mitt Skafferi" list
│   ├── AddFuelScreen.tsx         # Epic 2.2: Add product form
│   └── EditFuelScreen.tsx        # Epic 2.3: Edit product
├── programs/
│   ├── ProgramListScreen.tsx     # Epic 3.1: Browse programs
│   ├── ProgramDetailScreen.tsx   # Epic 3.3: Program overview
│   └── StartProgramScreen.tsx    # Epic 3.2: Start confirmation
├── session/
│   ├── SessionPlanScreen.tsx     # Epic 4: Pre-session planning
│   ├── ActiveSessionScreen.tsx   # Epic 5: Økt-modus UI
│   ├── SessionSummaryScreen.tsx  # Post-session summary
│   └── SessionAnalysisScreen.tsx # Epic 7: Analysis & insights
├── profile/
│   ├── ProfileScreen.tsx         # User profile view
│   └── SettingsScreen.tsx        # App settings
└── integration/
    ├── StravaConnectScreen.tsx   # Epic 6.1: OAuth flow
    └── ActivitySyncScreen.tsx    # Epic 6.2: Sync activities
```

---

### **`/src/navigation` - Navigation Setup**

```
src/navigation/
├── AppNavigator.tsx              # Root stack navigator
├── TabNavigator.tsx              # Bottom tab navigation
├── OnboardingNavigator.tsx       # Onboarding flow stack
├── SessionNavigator.tsx          # Session-related stack
├── linking.ts                    # Deep linking configuration
└── types.ts                      # Navigation type definitions
```

**Example structure:**
```typescript
// AppNavigator.tsx
<Stack.Navigator>
  {!onboardingComplete ? (
    <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
  ) : (
    <Stack.Screen name="Main" component={TabNavigator} />
  )}
  <Stack.Screen name="SessionActive" component={ActiveSessionScreen} />
  <Stack.Screen name="SessionAnalysis" component={SessionAnalysisScreen} />
</Stack.Navigator>
```

---

### **`/src/services` - Business Logic**

```
src/services/
├── database/
│   └── index.ts                  # Re-exports from /src/database
├── fuelPlanner.ts                # Epic 4: Fuel plan calculator
│   ├── calculateFuelPlan()
│   └── optimizeFuelDistribution()
├── sessionManager.ts             # Epic 5: Session lifecycle
│   ├── startSession()
│   ├── logEvent()
│   └── endSession()
├── correlationEngine.ts          # Epic 7: GI + Strava correlation
│   ├── matchSessionToActivity()
│   └── correlateEvents()
├── insightGenerator.ts           # Epic 7: Generate insights
│   ├── analyzeDiscomfortPatterns()
│   └── generateRecommendations()
├── stravaAPI.ts                  # Epic 6: Strava integration
│   ├── initiateOAuth()
│   ├── fetchActivities()
│   └── parseActivityData()
├── garminAPI.ts                  # Epic 6: Garmin integration
│   └── (similar to Strava)
├── notificationService.ts        # Epic 5: Scheduled notifications
│   ├── scheduleIntakeReminder()
│   └── cancelAllReminders()
└── exportService.ts              # Data export (CSV/JSON)
    ├── exportSessionsToCSV()
    └── exportDatabaseToJSON()
```

---

### **`/src/database` - Database Access Layer**

```
src/database/
├── index.ts                      # Main database instance & initialization
├── migrations/
│   ├── 001_initial_schema.ts     # Schema v1.0
│   └── migrationRunner.ts        # Migration execution logic
├── repositories/                 # Repository pattern (data access)
│   ├── UserRepository.ts         # CRUD for users table
│   ├── FuelProductRepository.ts  # CRUD for fuel_products
│   ├── ProgramRepository.ts      # Programs & program_sessions
│   ├── SessionRepository.ts      # Session logs & events
│   └── ExternalActivityRepository.ts
├── models/                       # TypeScript models (match DB schema)
│   ├── User.ts
│   ├── FuelProduct.ts
│   ├── Program.ts
│   ├── Session.ts
│   └── ExternalActivity.ts
└── seed/
    └── devData.ts                # Seed development data
```

**Example Repository:**
```typescript
// FuelProductRepository.ts
export class FuelProductRepository {
  async getAll(userId: number): Promise<FuelProduct[]> {
    return db.getAllAsync(
      'SELECT * FROM fuel_products WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );
  }

  async create(product: NewFuelProduct): Promise<number> {
    const result = await db.runAsync(
      'INSERT INTO fuel_products (user_id, name, product_type, carbs_per_serving) VALUES (?, ?, ?, ?)',
      [product.userId, product.name, product.type, product.carbs]
    );
    return result.lastInsertRowId;
  }

  async softDelete(id: number): Promise<void> {
    await db.runAsync(
      'UPDATE fuel_products SET deleted_at = datetime("now") WHERE id = ?',
      [id]
    );
  }
}
```

---

### **`/src/store` - State Management (Zustand)**

```
src/store/
├── index.ts                      # Combine stores
├── userStore.ts                  # User profile state
├── sessionStore.ts               # Active session state (Økt-modus)
├── fuelStore.ts                  # Fuel library state
├── programStore.ts               # User's active programs
└── appStore.ts                   # App-level state (onboarding, settings)
```

**Example Store:**
```typescript
// sessionStore.ts
import { create } from 'zustand';

interface SessionState {
  activeSession: SessionLog | null;
  isRunning: boolean;
  startTime: Date | null;
  events: SessionEvent[];

  startSession: (plannedSessionId?: number) => Promise<void>;
  logIntake: (fuelProductId: number, quantity: number) => Promise<void>;
  logDiscomfort: (level: number, type?: string) => Promise<void>;
  endSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  isRunning: false,
  startTime: null,
  events: [],

  startSession: async (plannedSessionId) => {
    const session = await SessionRepository.create({ plannedSessionId });
    set({ activeSession: session, isRunning: true, startTime: new Date() });
  },

  // ... other methods
}));
```

---

### **`/src/hooks` - Custom React Hooks**

```
src/hooks/
├── useDatabase.ts                # Database instance hook
├── useFuelProducts.ts            # Fetch fuel library
├── useActiveSession.ts           # Active session state + actions
├── useTimer.ts                   # Session timer logic
├── useNotifications.ts           # Notification permissions & scheduling
├── useStrava.ts                  # Strava OAuth & data fetching
└── useSessionAnalysis.ts         # Epic 7: Analysis data loading
```

**Example Hook:**
```typescript
// useFuelProducts.ts
export function useFuelProducts() {
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await FuelProductRepository.getAll(1); // userId=1
    setProducts(data);
    setLoading(false);
  };

  const addProduct = async (product: NewFuelProduct) => {
    await FuelProductRepository.create(product);
    await loadProducts(); // Refresh
  };

  return { products, loading, addProduct, refresh: loadProducts };
}
```

---

### **`/src/utils` - Utility Functions**

```
src/utils/
├── dateTime.ts                   # Date formatting, timezone conversion
├── calculations.ts               # Carb calculations, dosage
├── validation.ts                 # Input validation helpers
├── formatting.ts                 # Number/text formatting
├── constants.ts                  # App-wide constants (zones, thresholds)
└── logger.ts                     # Development logging
```

**Example Utilities:**
```typescript
// calculations.ts
export function calculateTotalCarbs(plan: FuelPlan[]): number {
  return plan.reduce((sum, item) => sum + item.carbs_total, 0);
}

export function calculateCarbRate(totalCarbs: number, durationMinutes: number): number {
  return (totalCarbs / durationMinutes) * 60; // g/hr
}

// dateTime.ts
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

---

### **`/src/constants`**

```
src/constants/
├── Colors.ts                     # Theme colors (Material Design 3)
├── HeartRateZones.ts             # HR zone definitions
├── ProgramTemplates.ts           # Hardcoded programs (before DB migration)
└── Config.ts                     # App configuration (API URLs, etc.)
```

**Example:**
```typescript
// HeartRateZones.ts
export const HEART_RATE_ZONES = {
  ZONE_1: { min: 0, max: 0.6, label: 'Recovery' },
  ZONE_2: { min: 0.6, max: 0.7, label: 'Endurance' },
  ZONE_3: { min: 0.7, max: 0.8, label: 'Tempo' },
  ZONE_4: { min: 0.8, max: 0.9, label: 'Threshold' },
  ZONE_5: { min: 0.9, max: 1.0, label: 'VO2 Max' },
};

export function getZoneFromHR(hr: number, maxHR: number): number {
  const percentage = hr / maxHR;
  if (percentage < 0.6) return 1;
  if (percentage < 0.7) return 2;
  if (percentage < 0.8) return 3;
  if (percentage < 0.9) return 4;
  return 5;
}
```

---

### **`/src/types` - TypeScript Definitions**

```
src/types/
├── database.ts                   # Database model types
├── navigation.ts                 # React Navigation types
├── api.ts                        # API response types (Strava/Garmin)
├── session.ts                    # Session-related types
└── index.ts                      # Re-export all types
```

**Example:**
```typescript
// database.ts
export interface FuelProduct {
  id: number;
  user_id: number;
  name: string;
  product_type: 'gel' | 'drink' | 'bar' | 'food';
  carbs_per_serving: number;
  serving_size?: string;
  notes?: string;
  created_at: string;
  deleted_at?: string;
}

export interface SessionEvent {
  id: number;
  session_log_id: number;
  event_type: 'intake' | 'discomfort' | 'note';
  timestamp_offset_seconds: number;
  actual_timestamp: string;
  data_json: IntakeData | DiscomfortData | NoteData;
}

export interface IntakeData {
  fuel_product_id: number;
  product_name: string;
  quantity: number;
  carbs_consumed: number;
  was_planned: boolean;
}

export interface DiscomfortData {
  level: 1 | 2 | 3 | 4 | 5;
  type?: 'nausea' | 'cramping' | 'bloating' | 'other';
  notes?: string;
}
```

---

### **`/src/theme` - Theming**

```
src/theme/
├── index.ts                      # Main theme export
├── colors.ts                     # Color palette (Material Design 3)
├── typography.ts                 # Font styles
└── spacing.ts                    # Spacing constants
```

**Example:**
```typescript
// index.ts (React Native Paper theme)
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E88E5',      // Blue
    secondary: '#43A047',    // Green (success)
    error: '#E53935',        // Red (discomfort)
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#42A5F5',
    secondary: '#66BB6A',
    error: '#EF5350',
  },
};
```

---

### **`/assets` - Static Assets**

```
assets/
├── images/
│   ├── icon.png                  # App icon (1024x1024)
│   ├── splash.png                # Splash screen
│   ├── adaptive-icon.png         # Android adaptive icon
│   └── illustrations/
│       ├── onboarding-1.svg      # Onboarding graphics
│       └── empty-state.svg       # Empty state illustrations
├── fonts/
│   └── (custom fonts if needed)
└── sounds/
    └── intake-reminder.mp3       # Notification sound
```

---

### **`/migrations` - Database Migrations**

```
migrations/
├── 001_initial_schema.sql        # Initial schema (SQL DDL)
├── 002_seed_programs.sql         # Seed default programs
└── README.md                     # Migration instructions
```

---

### **`/docs` - Documentation**

```
docs/
├── architecture/
│   ├── tech-stack.md             # ✅ Created
│   ├── database-schema.md        # ✅ Created
│   ├── source-tree.md            # ✅ This file
│   └── coding-standards.md       # (To be created)
├── prd/
│   └── (Product Requirements - future)
└── qa/
    └── (Test plans - future)
```

---

### **Root Configuration Files**

#### **`app.json`** - Expo Configuration
```json
{
  "expo": {
    "name": "GI Diary",
    "slug": "gi-diary",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E88E5"
    },
    "platforms": ["android"],
    "android": {
      "package": "com.ultragi.gidiary",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1E88E5"
      },
      "permissions": [
        "NOTIFICATIONS",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-sqlite",
      "expo-notifications",
      "expo-secure-store"
    ]
  }
}
```

#### **`package.json`** - Dependencies
```json
{
  "name": "gi-diary",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "test": "jest",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "react-native": "0.76.x",
    "react-navigation": "^7.x",
    "react-native-paper": "^5.x",
    "expo-sqlite": "~14.0.0",
    "zustand": "^5.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "victory-native": "^37.x",
    "expo-notifications": "~0.28.0",
    "expo-task-manager": "~11.8.0",
    "expo-secure-store": "~13.0.0",
    "expo-haptics": "~13.0.0",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "jest": "^29.x"
  }
}
```

#### **`tsconfig.json`** - TypeScript Config
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@database/*": ["src/database/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### **`.gitignore`**
```
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Environment
.env
.env.local

# macOS
.DS_Store

# IDE
.vscode/
.idea/

# Database (local development)
*.db
*.db-journal
```

#### **`.env.example`**
```
# Strava API (for future integration)
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here

# Garmin API (for future integration)
GARMIN_CONSUMER_KEY=your_consumer_key_here
GARMIN_CONSUMER_SECRET=your_consumer_secret_here

# App Configuration
NODE_ENV=development
```

---

## File Naming Conventions

### **Components & Screens**
- **PascalCase** for files: `FuelProductCard.tsx`
- **Match export name**: `export default FuelProductCard`

### **Utilities & Services**
- **camelCase** for files: `fuelPlanner.ts`
- **Named exports**: `export function calculateFuelPlan() {}`

### **Types**
- **camelCase** for files: `database.ts`
- **PascalCase** for interfaces: `export interface FuelProduct {}`

### **Constants**
- **PascalCase** for files: `HeartRateZones.ts`
- **SCREAMING_SNAKE_CASE** for exports: `export const MAX_HR_ZONE = 5;`

---

## Import Path Aliases (Configured in tsconfig.json)

```typescript
// Instead of:
import { FuelProduct } from '../../../types/database';
import { useDatabase } from '../../../hooks/useDatabase';

// Use:
import { FuelProduct } from '@types/database';
import { useDatabase } from '@hooks/useDatabase';
```

---

## Code Organization Best Practices

### **1. Colocation**
- Keep related files together (e.g., `SessionTimer.tsx` + `SessionTimer.test.tsx`)

### **2. Single Responsibility**
- Each file/component should have ONE clear purpose
- Prefer smaller, focused components over large monoliths

### **3. Barrel Exports**
- Use `index.ts` to re-export from folders:
```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';

// Usage:
import { Button, Card } from '@components/ui';
```

### **4. Separation of Concerns**
- **Screens**: Minimal logic, orchestrate components
- **Components**: Presentation + local state only
- **Services**: Business logic, no UI
- **Repositories**: Database access only

---

## Development Workflow

### **1. Create New Feature**
```bash
# Example: Adding "Export to CSV" feature

# 1. Create service
touch src/services/exportService.ts

# 2. Create screen
touch src/screens/settings/ExportScreen.tsx

# 3. Create component (if needed)
touch src/components/settings/ExportButton.tsx

# 4. Add route to navigator
# Edit: src/navigation/AppNavigator.tsx

# 5. Test in emulator
npx expo start
```

### **2. Testing Changes**
```bash
# Start Expo dev server
npx expo start

# Open Android emulator
# Press 'a' in terminal

# OR scan QR code with Expo Go on physical device
```

### **3. Building APK**
```bash
# First-time setup
eas build:configure

# Build production APK
eas build --platform android --profile production

# Download APK from EAS dashboard
# Install via: adb install path/to/app.apk
```

---

## Next Steps

1. **Initialize Expo Project**: Run scaffold generation (see next todo)
2. **Create Coding Standards**: Define linting rules, component patterns
3. **Implement Epic 1**: Onboarding flow (first feature)
4. **Set up Database**: Run initial migration, seed dev data

---

## References

- [Expo Project Structure](https://docs.expo.dev/workflow/expo-cli/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
