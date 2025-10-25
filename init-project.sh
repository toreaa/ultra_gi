#!/bin/bash

# GI Diary - Project Initialization Script
# This script creates the initial directory structure for the React Native Expo app

echo "🚀 Initializing GI Diary project structure..."

# Create main directories
mkdir -p src/{components,screens,navigation,services,database,store,hooks,utils,constants,types,theme}
mkdir -p src/components/{ui,fuel,session,charts,program,common}
mkdir -p src/screens/{onboarding,home,fuel,programs,session,profile,integration}
mkdir -p src/database/{migrations,repositories,models,seed}
mkdir -p assets/{images/illustrations,fonts,sounds}
mkdir -p migrations
mkdir -p __tests__

echo "✅ Directory structure created"

# Create placeholder index files for barrel exports
cat > src/components/ui/index.ts << 'EOF'
// UI Components barrel export
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
EOF

cat > src/components/index.ts << 'EOF'
// Components barrel export
export * from './ui';
export * from './fuel';
export * from './session';
export * from './charts';
export * from './program';
export * from './common';
EOF

cat > src/database/index.ts << 'EOF'
// Database exports
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('gi_diary.db');
  await runMigrations(db);
  return db;
}

export async function getDatabase() {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase) {
  // Migration logic will be implemented here
  console.log('Running database migrations...');
}

export * from './repositories';
export * from './models';
EOF

cat > src/types/index.ts << 'EOF'
// Type definitions barrel export
export * from './database';
export * from './navigation';
export * from './session';
EOF

cat > src/utils/index.ts << 'EOF'
// Utilities barrel export
export * from './dateTime';
export * from './calculations';
export * from './validation';
export * from './formatting';
EOF

echo "✅ Barrel exports created"

# Create basic TypeScript type definitions
cat > src/types/database.ts << 'EOF'
// Database model types

export interface User {
  id: number;
  name: string;
  weight_kg?: number;
  onboarded_at: string;
  primary_goal?: string;
  primary_gi_issue?: string;
  created_at: string;
  updated_at: string;
}

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

export interface Program {
  id: number;
  name: string;
  description?: string;
  duration_weeks: number;
  target_audience?: string;
  research_source?: string;
  created_at: string;
  is_active: boolean;
}

export interface ProgramSession {
  id: number;
  program_id: number;
  week_number: number;
  session_number: number;
  duration_minutes: number;
  carb_rate_g_per_hour: number;
  intensity_zone?: string;
  notes?: string;
}

export interface SessionLog {
  id: number;
  user_id: number;
  planned_session_id?: number;
  started_at: string;
  ended_at?: string;
  duration_actual_minutes?: number;
  session_status: 'active' | 'completed' | 'abandoned';
  post_session_notes?: string;
  created_at: string;
}

export interface SessionEvent {
  id: number;
  session_log_id: number;
  event_type: 'intake' | 'discomfort' | 'note';
  timestamp_offset_seconds: number;
  actual_timestamp: string;
  data_json: string; // JSON string
  created_at: string;
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

export interface NoteData {
  text: string;
}
EOF

cat > src/types/navigation.ts << 'EOF'
// Navigation type definitions
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  SessionActive: { sessionId: number };
  SessionAnalysis: { sessionId: number };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Goals: undefined;
  ProgramSuggestion: { goal: string; issue: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Skafferi: undefined;
  Programs: undefined;
  Profile: undefined;
};
EOF

cat > src/types/session.ts << 'EOF'
// Session-related types
export interface FuelPlanItem {
  fuel_product_id: number;
  product_name: string;
  quantity: number;
  timing_minutes: number;
  carbs_total: number;
}

export type FuelPlan = FuelPlanItem[];
EOF

echo "✅ TypeScript types created"

# Create constants
cat > src/constants/HeartRateZones.ts << 'EOF'
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
EOF

cat > src/constants/Colors.ts << 'EOF'
export const Colors = {
  primary: '#1E88E5',
  secondary: '#43A047',
  error: '#E53935',
  warning: '#FB8C00',
  success: '#43A047',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
};
EOF

echo "✅ Constants created"

# Create utility functions
cat > src/utils/dateTime.ts << 'EOF'
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function fromISOString(isoString: string): Date {
  return new Date(isoString);
}
EOF

cat > src/utils/calculations.ts << 'EOF'
import { FuelPlan } from '../types/session';

export function calculateTotalCarbs(plan: FuelPlan): number {
  return plan.reduce((sum, item) => sum + item.carbs_total, 0);
}

export function calculateCarbRate(totalCarbs: number, durationMinutes: number): number {
  return (totalCarbs / durationMinutes) * 60; // g/hr
}

export function calculateRequiredCarbs(durationMinutes: number, targetGPerHour: number): number {
  return (durationMinutes / 60) * targetGPerHour;
}
EOF

cat > src/utils/validation.ts << 'EOF'
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && value.trim() !== '';
}

export function isPositiveNumber(value: number): boolean {
  return value > 0;
}
EOF

cat > src/utils/formatting.ts << 'EOF'
export function formatCarbs(grams: number): string {
  return `${grams}g`;
}

export function formatCarbRate(gPerHour: number): string {
  return `${gPerHour}g/h`;
}

export function formatDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
EOF

echo "✅ Utility functions created"

# Create initial database migration
cat > migrations/001_initial_schema.sql << 'EOF'
-- GI Diary - Initial Schema v1.0
-- Run on first app launch

PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  weight_kg REAL,
  onboarded_at TEXT NOT NULL,
  primary_goal TEXT,
  primary_gi_issue TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_created_at ON users(created_at);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  target_audience TEXT,
  research_source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_programs_active ON programs(is_active);

-- Program sessions table
CREATE TABLE IF NOT EXISTS program_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  carb_rate_g_per_hour INTEGER NOT NULL,
  intensity_zone TEXT,
  notes TEXT,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE INDEX idx_program_sessions_program ON program_sessions(program_id);
CREATE INDEX idx_program_sessions_week ON program_sessions(program_id, week_number);
CREATE UNIQUE INDEX idx_program_sessions_unique ON program_sessions(program_id, week_number, session_number);

-- Fuel products table
CREATE TABLE IF NOT EXISTS fuel_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  carbs_per_serving REAL NOT NULL,
  serving_size TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_fuel_products_user ON fuel_products(user_id);
CREATE INDEX idx_fuel_products_active ON fuel_products(user_id, deleted_at);

-- User programs table
CREATE TABLE IF NOT EXISTS user_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_programs_user ON user_programs(user_id);
CREATE INDEX idx_user_programs_status ON user_programs(user_id, status);

-- Planned sessions table
CREATE TABLE IF NOT EXISTS planned_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_session_id INTEGER,
  planned_date TEXT NOT NULL,
  fuel_plan_json TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_session_id) REFERENCES program_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_planned_sessions_user ON planned_sessions(user_id);
CREATE INDEX idx_planned_sessions_date ON planned_sessions(planned_date);

-- Session logs table
CREATE TABLE IF NOT EXISTS session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  planned_session_id INTEGER,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_actual_minutes INTEGER,
  session_status TEXT NOT NULL DEFAULT 'active',
  post_session_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (planned_session_id) REFERENCES planned_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_session_logs_user ON session_logs(user_id);
CREATE INDEX idx_session_logs_started ON session_logs(started_at);
CREATE INDEX idx_session_logs_status ON session_logs(session_status);

-- Session events table
CREATE TABLE IF NOT EXISTS session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  timestamp_offset_seconds INTEGER NOT NULL,
  actual_timestamp TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_events_log ON session_events(session_log_id);
CREATE INDEX idx_session_events_type ON session_events(session_log_id, event_type);
CREATE INDEX idx_session_events_time ON session_events(session_log_id, timestamp_offset_seconds);

-- External activities table
CREATE TABLE IF NOT EXISTS external_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  source TEXT NOT NULL,
  external_activity_id TEXT NOT NULL,
  activity_type TEXT,
  started_at_external TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  distance_meters REAL,
  timeseries_json TEXT NOT NULL,
  raw_data_json TEXT,
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_external_activities_session ON external_activities(session_log_id);
CREATE INDEX idx_external_activities_source ON external_activities(source, external_activity_id);
CREATE UNIQUE INDEX idx_external_activities_unique ON external_activities(session_log_id);

-- App metadata table
CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default program
INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
VALUES (
  '4-Week Base Carb Training',
  'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
  4,
  'Endurance athletes new to carb training',
  'Based on Jeukendrup (2014) gut training protocols'
);

-- Seed program sessions
INSERT INTO program_sessions (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone, notes)
VALUES
  (1, 1, 1, 60, 30, 'Zone 2', 'Start easy, focus on tolerance'),
  (1, 1, 2, 60, 30, 'Zone 2', 'Repeat Week 1 Session 1'),
  (1, 2, 1, 75, 45, 'Zone 2-3', 'Increase duration and carb rate'),
  (1, 2, 2, 75, 45, 'Zone 2-3', 'Repeat Week 2 Session 1'),
  (1, 3, 1, 90, 60, 'Zone 2-3', 'Target race pace carb intake'),
  (1, 3, 2, 90, 60, 'Zone 2-3', 'Repeat Week 3 Session 1'),
  (1, 4, 1, 120, 60, 'Zone 2-3', 'Long session at race pace fueling'),
  (1, 4, 2, 120, 60, 'Zone 2-3', 'Final long session');

-- Set schema version
INSERT INTO app_metadata (key, value) VALUES ('schema_version', '1.0');

-- Mark as initialized
INSERT INTO app_metadata (key, value) VALUES ('db_initialized', 'true');
EOF

echo "✅ Initial database migration created"

# Create .env.example
cat > .env.example << 'EOF'
# Strava API (for future integration)
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here

# Garmin API (for future integration)
GARMIN_CONSUMER_KEY=your_consumer_key_here
GARMIN_CONSUMER_SECRET=your_consumer_secret_here

# App Configuration
NODE_ENV=development
EOF

echo "✅ Environment template created"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*

# Environment
.env
.env.local

# macOS
.DS_Store

# IDE
.vscode/
.idea/

# Logs
npm-debug.*
yarn-debug.*
yarn-error.*

# Database (local development)
*.db
*.db-journal

# Build artifacts
*.apk
*.aab
*.ipa
EOF

echo "✅ .gitignore created"

# Create README
cat > README.md << 'EOF'
# GI Diary

Mobile application for tracking gastrointestinal training during endurance sports.

## Tech Stack

- **Framework:** React Native + Expo
- **Database:** SQLite (local, offline-first)
- **State:** Zustand
- **UI:** React Native Paper (Material Design 3)
- **Navigation:** React Navigation

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for emulator)
- Expo Go app (for physical device testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android emulator
npx expo run:android

# Or scan QR code with Expo Go app
```

## Project Structure

See `docs/architecture/source-tree.md` for detailed structure.

```
ultra_gi/
├── src/                  # Application source
│   ├── components/       # Reusable components
│   ├── screens/          # Screen components
│   ├── database/         # Database layer
│   ├── services/         # Business logic
│   ├── store/            # State management
│   └── ...
├── assets/               # Images, fonts, sounds
├── migrations/           # Database migrations
└── docs/                 # Documentation
```

## Architecture

See `docs/architecture/` for:
- `tech-stack.md` - Technology decisions
- `database-schema.md` - Database structure
- `source-tree.md` - File organization

## Roadmap

### Epic 1: Onboarding ✅
- User profile setup
- Goal & GI issue selection
- Program recommendation

### Epic 2: Fuel Library
- Personal fuel product management
- CRUD operations

### Epic 3: Training Programs
- Browse pre-built programs
- Start program

### Epic 4: Session Planning
- Generate fuel plan from products
- Pre-session preparation

### Epic 5: Økt-modus (Active Session)
- Timer with intake reminders
- Log intake & discomfort
- Background execution

### Epic 6: Integrations (Future)
- Strava OAuth
- Garmin Connect

### Epic 7: Analysis & Insights
- Correlate GI events with HR/elevation
- Generate insights
- Recommendations

## License

Proprietary - All rights reserved
EOF

echo "✅ README created"

echo ""
echo "✨ Project structure initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Install Expo CLI: npm install -g expo-cli"
echo "2. Initialize Expo project: npx create-expo-app@latest . (in this directory)"
echo "3. Install dependencies: npm install (see docs/architecture/tech-stack.md for package list)"
echo "4. Start development: npx expo start"
echo ""
echo "📚 Documentation created:"
echo "   - docs/architecture/tech-stack.md"
echo "   - docs/architecture/database-schema.md"
echo "   - docs/architecture/source-tree.md"
echo ""
echo "🎯 Ready to start building!"
