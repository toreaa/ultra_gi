# GI Diary - Technical Architecture Summary

**Created:** 2025-10-23
**Status:** Ready for Development

---

## ✅ What Has Been Created

### 1. **Complete Architecture Documentation**

Located in `docs/architecture/`:

- **`tech-stack.md`** (12KB) - Technology decisions, framework choices, dependencies
- **`database-schema.md`** (20KB) - Complete SQLite schema with DDL, queries, examples
- **`source-tree.md`** (24KB) - Project structure, file organization, naming conventions
- **`coding-standards.md`** (16KB) - TypeScript style guide, React patterns, best practices

### 2. **Project Scaffold**

Complete directory structure created:

```
ultra_gi/
├── src/                          # Application source
│   ├── components/               # UI components (ui, fuel, session, charts, program, common)
│   ├── screens/                  # Screen components (onboarding, home, fuel, programs, session, profile)
│   ├── database/                 # Database layer (migrations, repositories, models, seed)
│   ├── services/                 # Business logic
│   ├── store/                    # State management (Zustand)
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utilities (dateTime, calculations, validation, formatting)
│   ├── constants/                # Constants (Colors, HeartRateZones)
│   ├── types/                    # TypeScript definitions (database, navigation, session)
│   └── theme/                    # Theming
├── assets/                       # Images, fonts, sounds
├── migrations/                   # Database migrations
│   └── 001_initial_schema.sql    # ✅ Complete SQLite schema ready
├── docs/                         # Documentation
└── Configuration files (see below)
```

### 3. **Database Foundation**

**File:** `migrations/001_initial_schema.sql`

Complete schema including:
- 9 tables (users, programs, fuel_products, sessions, events, etc.)
- Proper indexes and foreign keys
- Seed data (4-week training program with 8 sessions)
- Ready to execute on first app launch

### 4. **TypeScript Foundation**

Pre-built type definitions in `src/types/`:
- `database.ts` - All database models (User, FuelProduct, SessionLog, etc.)
- `navigation.ts` - React Navigation types
- `session.ts` - Session-related types (FuelPlan, etc.)

### 5. **Utility Functions**

Ready-to-use utilities in `src/utils/`:
- `dateTime.ts` - Duration formatting, ISO conversions
- `calculations.ts` - Carb calculations, fuel planning math
- `validation.ts` - Input validation helpers
- `formatting.ts` - Display formatting

### 6. **Configuration Files**

- `.gitignore` - Comprehensive ignore rules
- `.env.example` - Environment variable template
- `README.md` - Project overview and setup instructions
- `init-project.sh` - Initialization script (already executed)

---

## 📋 Technology Stack (Confirmed)

### **Core**
- **Framework:** React Native + Expo (Managed Workflow)
- **Language:** TypeScript (strict mode)
- **Database:** SQLite (expo-sqlite)
- **State:** Zustand (lightweight, no boilerplate)

### **UI**
- **Components:** React Native Paper (Material Design 3)
- **Navigation:** React Navigation v7
- **Charts:** Victory Native
- **Forms:** React Hook Form + Zod validation

### **Device APIs**
- **Notifications:** expo-notifications
- **Background Tasks:** expo-task-manager
- **Secure Storage:** expo-secure-store (for OAuth tokens)
- **Haptics:** expo-haptics

---

## 🎯 Next Steps

### **Step 1: Install Expo (5 minutes)**

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Initialize Expo project in this directory
npx create-expo-app@latest . --template blank-typescript

# This will add:
# - app.json (Expo config)
# - package.json (dependencies)
# - App.tsx (entry point)
# - tsconfig.json (TypeScript config)
```

### **Step 2: Install Dependencies (10 minutes)**

```bash
# Core dependencies
npx expo install expo-sqlite expo-router react-native-paper

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State management
npm install zustand

# Forms
npm install react-hook-form zod

# Charts
npm install victory-native

# Device APIs
npx expo install expo-notifications expo-task-manager expo-secure-store expo-haptics

# Utilities
npm install date-fns

# Dev dependencies
npm install --save-dev @types/react @types/react-native eslint prettier
```

### **Step 3: Configure Expo (5 minutes)**

Edit `app.json`:

```json
{
  "expo": {
    "name": "GI Diary",
    "slug": "gi-diary",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["android"],
    "android": {
      "package": "com.ultragi.gidiary",
      "permissions": ["NOTIFICATIONS"]
    },
    "plugins": [
      "expo-sqlite",
      "expo-notifications",
      "expo-secure-store"
    ]
  }
}
```

### **Step 4: Initialize Database (10 minutes)**

Update `src/database/index.ts` to run migrations on first launch:

```typescript
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync('gi_diary.db');

  // Check if already initialized
  const metadata = await db.getFirstAsync(
    'SELECT value FROM app_metadata WHERE key = "db_initialized"'
  );

  if (!metadata) {
    // Run migration
    const migrationSQL = await FileSystem.readAsStringAsync(
      'migrations/001_initial_schema.sql'
    );
    await db.execAsync(migrationSQL);
    console.log('✅ Database initialized');
  }

  return db;
}
```

### **Step 5: Test Setup (5 minutes)**

```bash
# Start Expo dev server
npx expo start

# Options:
# - Press 'a' to open Android emulator (requires Android Studio)
# - Scan QR code with Expo Go app on physical Android device
```

---

## 🚀 Development Roadmap

### **Phase 1: MVP Core (Weeks 1-4)**

**Week 1: Foundation**
- [ ] Initialize Expo project
- [ ] Set up database + repositories
- [ ] Create basic navigation structure
- [ ] Epic 1: Onboarding flow (3 screens)

**Week 2: Fuel Library**
- [ ] Epic 2: Fuel product CRUD
- [ ] FuelLibraryScreen + components
- [ ] Form validation

**Week 3: Programs & Planning**
- [ ] Epic 3: Program list + detail
- [ ] Epic 4: Session planning logic
- [ ] Fuel plan calculator

**Week 4: Økt-modus (Active Session)**
- [ ] Epic 5: Timer + notifications
- [ ] Event logging (intake/discomfort)
- [ ] Background task management

### **Phase 2: Integrations (Weeks 5-6)**

**Week 5: Strava Integration**
- [ ] Epic 6: OAuth PKCE flow
- [ ] Activity fetching
- [ ] Data parsing (JSON → timeseries)

**Week 6: Analysis**
- [ ] Epic 7: Correlation engine
- [ ] Charts (Victory Native)
- [ ] Basic insight rules

### **Phase 3: Polish & Testing (Week 7)**

- [ ] UI polish
- [ ] Unit tests for critical logic
- [ ] Beta testing (internal)
- [ ] Bug fixes

### **Phase 4: Launch (Week 8)**

- [ ] Build production APK (EAS Build)
- [ ] Google Play Console setup
- [ ] Internal Testing track
- [ ] Launch 🎉

---

## 📊 Epic Breakdown

Mapping to your original Epic structure:

| Epic | Status | Files to Create |
|------|--------|-----------------|
| **Epic 1: Onboarding** | 📋 Ready | `WelcomeScreen.tsx`, `GoalsScreen.tsx`, `ProgramSuggestionScreen.tsx` |
| **Epic 2: Fuel Library** | 📋 Ready | `FuelLibraryScreen.tsx`, `FuelProductRepository.ts`, `FuelProductForm.tsx` |
| **Epic 3: Programs** | 📋 Ready | `ProgramListScreen.tsx`, `ProgramDetailScreen.tsx`, `ProgramRepository.ts` |
| **Epic 4: Session Planning** | 📋 Ready | `SessionPlanScreen.tsx`, `fuelPlanner.ts` |
| **Epic 5: Økt-modus** | 📋 Ready | `ActiveSessionScreen.tsx`, `SessionTimer.tsx`, `sessionManager.ts` |
| **Epic 6: Integrations** | 📋 Ready | `StravaConnectScreen.tsx`, `stravaAPI.ts` |
| **Epic 7: Analysis** | 📋 Ready | `SessionAnalysisScreen.tsx`, `correlationEngine.ts`, `insightGenerator.ts` |

---

## 🔑 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **React Native + Expo** | Cross-platform (Android → iOS), rapid iteration, AI-friendly |
| **SQLite (not AsyncStorage)** | Structured queries, ACID compliance, future-proof |
| **Zustand (not Redux)** | Simpler for MVP, less boilerplate, sufficient for needs |
| **Offline-first** | No backend = lower complexity, better privacy, niche product fit |
| **Material Design 3** | Android-native feel, React Native Paper excellent support |
| **Repository Pattern** | Clean separation, testable, easy to mock |

---

## 📖 Documentation Reference

All documentation is in `docs/architecture/`:

1. **Getting Started?** → Read `tech-stack.md` first
2. **Need database info?** → See `database-schema.md`
3. **Where does code go?** → Check `source-tree.md`
4. **How should I code?** → Follow `coding-standards.md`

---

## 🎓 Learning Resources

For AI-assisted development:

- [Expo Documentation](https://docs.expo.dev/) - Primary reference
- [React Native Paper](https://callstack.github.io/react-native-paper/) - UI components
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) - Database API
- [React Navigation](https://reactnavigation.org/) - Navigation patterns

---

## ✅ Checklist: Ready to Code

- [x] Architecture documented
- [x] Directory structure created
- [x] Database schema defined
- [x] TypeScript types created
- [x] Utilities scaffolded
- [x] Migration SQL ready
- [ ] Expo project initialized (next step!)
- [ ] Dependencies installed (next step!)
- [ ] First screen created (next step!)

---

## 💡 Pro Tips for AI-Assisted Development

1. **Always reference architecture docs** - They contain the source of truth
2. **Use path aliases** - `@components/*`, `@types/*` (configured in tsconfig)
3. **Follow coding standards** - Consistency helps AI understand patterns
4. **Test on emulator frequently** - Catch issues early
5. **Start with Epic 1** - Onboarding is the simplest, good warmup

---

## 🚧 Known Limitations (MVP)

- **Single user only** (schema supports multi-user for later)
- **No cloud sync** (offline-first by design)
- **Hardcoded programs** (will move to DB in v1.2)
- **No automated tests yet** (add in v1.1)
- **Basic insight rules** (LLM integration later)

---

## 📞 Support

For questions about architecture decisions, see:
- Technical: `docs/architecture/tech-stack.md`
- Database: `docs/architecture/database-schema.md`
- Organization: `docs/architecture/source-tree.md`
- Code style: `docs/architecture/coding-standards.md`

---

**Status:** ✅ Architecture Complete - Ready for Implementation

**Next Action:** Run Step 1 (Install Expo) to begin development!
