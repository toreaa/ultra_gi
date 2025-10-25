# Tech Stack - GI Diary

**Version:** 1.0
**Last Updated:** 2025-10-23
**Status:** Architecture Definition

---

## Overview

GI Diary is an **offline-first, mobile-native Android application** for tracking gastrointestinal training during endurance sports. The architecture prioritizes local data storage, rapid iteration, and future iOS compatibility.

---

## Core Technology Decisions

### **Mobile Framework: React Native + Expo**

**Choice:** Expo Managed Workflow
**Version:** Expo SDK 52+ (React Native 0.76+)

**Rationale:**
- ✅ Single codebase for Android → iOS migration
- ✅ Rapid development with hot reload
- ✅ Zero native configuration for MVP
- ✅ Excellent AI-assisted development support
- ✅ Mature ecosystem for mobile-specific features
- ✅ Easy testing on Mac via Android emulator or Expo Go

**Alternatives Considered:**
- Flutter: Rejected (less AI tooling support, Dart ecosystem smaller)
- Native Kotlin: Rejected (no iOS path, slower iteration)
- React Native CLI: Rejected (more complex setup than Expo for MVP)

---

## Stack Components

### **1. Frontend Framework**

```
React Native (Expo SDK 52+)
├── UI Framework: React Native Paper (Material Design 3)
├── Navigation: React Navigation v7
├── State Management: Zustand (lightweight, no boilerplate)
├── Forms: React Hook Form + Zod validation
├── Charts: Victory Native (for session analysis)
└── Icons: React Native Vector Icons (MaterialCommunityIcons)
```

**UI Framework Choice: React Native Paper**
- Material Design 3 theming
- Android-native feel
- Accessibility built-in
- Customizable for iOS later

**State Management: Zustand**
- Simpler than Redux for MVP
- Typescript-first
- Minimal boilerplate
- Easy to migrate to Redux Toolkit if needed

---

### **2. Local Database**

```
expo-sqlite (SQLite 3.x)
├── ORM: Drizzle ORM (optional, consider for v2)
├── Migrations: Custom SQL migration scripts
└── Backup: Export to JSON via FileSystem API
```

**Why SQLite:**
- Native to Android/iOS (zero install overhead)
- Single `.db` file (easy backup/restore)
- ACID compliance (critical for session logging)
- Structured queries (future analytics)
- File-based encryption available (SQLCipher if needed)

**Schema Philosophy:**
- Normalized structure (Users, Programs, Sessions, Events)
- JSON columns for flexible data (fuel_plan_json, timeseries_json)
- Timestamps in UTC (converted to local in UI)

---

### **3. Real-Time Features ("Økt-modus")**

```
Timer & Notifications:
├── Timer: React hooks (useState + useEffect)
├── Background execution: expo-task-manager
├── Notifications: expo-notifications
├── Haptic feedback: expo-haptics
└── Keep-alive: expo-background-fetch
```

**Critical Requirements:**
- App must stay active during 2-4 hour sessions
- Notifications for planned intake timing
- Background timer continues if app minimized
- Vibration/sound alerts

**Implementation Strategy:**
- Foreground service (Android) keeps timer running
- Local notifications scheduled dynamically
- State persisted to SQLite every 30s (crash recovery)

---

### **4. Third-Party Integrations**

```
OAuth & API Integration (Future):
├── Strava API v3 (OAuth 2.0 PKCE)
├── Garmin Connect API (OAuth 1.0a)
├── Token Storage: expo-secure-store
└── Data Parsing: Custom (GPX, JSON, TCX)
```

**Phase:** Not MVP, but architecture-ready

**OAuth Flow (Offline-first):**
1. User initiates OAuth in-app browser
2. PKCE flow (no backend required)
3. Tokens stored in SecureStore (encrypted)
4. Manual sync trigger (pull last 10 activities)
5. Parse timeseries data → SQLite

**Data Format:**
- Strava: JSON API response
- Garmin: FIT files → parsed to JSON
- Storage: `timeseries_json` column (heart rate, elevation arrays)

---

### **5. Development Tools**

```
Development Environment:
├── IDE: VS Code + extensions
│   ├── ESLint + Prettier
│   ├── Expo Tools
│   └── React Native snippets
├── Testing:
│   ├── Android Studio Emulator (Pixel 6, API 34)
│   ├── Expo Go (physical device testing)
│   └── Jest + React Native Testing Library (unit tests)
├── Build: Expo Application Services (EAS)
└── Version Control: Git + GitHub
```

**Testing Strategy (MVP):**
- Manual testing via emulator/Expo Go
- Unit tests for critical business logic (fuel calculator, correlation engine)
- E2E testing deferred post-MVP

**CI/CD (Future):**
- GitHub Actions → EAS Build → APK
- Automated testing on PRs
- Staged rollout via Google Play Internal Testing

---

### **6. Data Visualization & Analysis**

```
Charts & Insights:
├── Charting: Victory Native
├── Data Processing: JavaScript (in-app)
├── Insight Engine: Rule-based (v1) → LLM API (v2)
└── Export: CSV/JSON via expo-sharing
```

**Victory Native:**
- Native performance (no WebView)
- Line charts (HR, elevation)
- Scatter plots (intake/discomfort markers)
- Annotated timelines

**Insight Generation (MVP):**
```javascript
// Rule-based examples:
if (discomfort > 3 && heartRate > zone4Threshold) {
  return "High intensity may have triggered discomfort";
}

if (intakeTime < discomfortTime - 10min) {
  return "Try consuming fuel earlier before high-intensity segments";
}
```

**Future:** OpenAI/Anthropic API for natural language insights (requires internet)

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  ┌─────────────────────────────────────┐   │
│  │  React Native Components            │   │
│  │  • Onboarding Wizard                │   │
│  │  • Fuel Library (Skafferi)          │   │
│  │  • Session Planning                 │   │
│  │  • Økt-modus (Timer + Logging)      │   │
│  │  • Analysis Dashboard               │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│         State Management (Zustand)          │
│  • App State                                │
│  • Active Session State                     │
│  • User Preferences                         │
├─────────────────────────────────────────────┤
│           Business Logic Layer              │
│  • Fuel Plan Calculator                     │
│  • Session Correlation Engine               │
│  • Insight Generator (Rule Engine)          │
│  • Program Recommendation Logic             │
├─────────────────────────────────────────────┤
│          Data Access Layer (DAL)            │
│  • SQLite queries (via expo-sqlite)         │
│  • CRUD operations                          │
│  • Transaction management                   │
├─────────────────────────────────────────────┤
│           Persistence Layer                 │
│  • SQLite Database (.db file)               │
│  • SecureStore (OAuth tokens)               │
│  • FileSystem (exports, backups)            │
├─────────────────────────────────────────────┤
│          Device APIs & Services             │
│  • Notifications                            │
│  • Background Tasks                         │
│  • Haptics                                  │
│  • Secure Storage                           │
└─────────────────────────────────────────────┘
         ↕ (Future: OAuth PKCE)
┌─────────────────────────────────────────────┐
│        External APIs (Optional)             │
│        • Strava API v3                      │
│        • Garmin Connect API                 │
└─────────────────────────────────────────────┘
```

---

## Security & Privacy

### **Data Privacy (GDPR Compliant)**
- ✅ All data stored locally on device
- ✅ No backend = no data exfiltration risk
- ✅ User owns their data (can export/delete)
- ✅ OAuth tokens encrypted (expo-secure-store)

### **Security Measures**
```
Security Layer:
├── OAuth Tokens: expo-secure-store (AES-256)
├── Database: SQLite (plaintext MVP, SQLCipher optional)
├── Permissions: Minimal (notifications, filesystem)
└── Code: No sensitive data in source, env vars via .env
```

### **App Permissions Required**
- `NOTIFICATIONS` (intake reminders)
- `WRITE_EXTERNAL_STORAGE` (backup export, Android < 13)
- `INTERNET` (OAuth + Strava sync only, optional)

---

## Performance Targets (MVP)

| Metric | Target | Rationale |
|--------|--------|-----------|
| App Launch | < 2s | Native feel |
| Database Query | < 50ms | Smooth UI |
| Timer Accuracy | ± 1s | Acceptable for nutrition timing |
| Chart Render | < 500ms | Acceptable for analysis view |
| APK Size | < 50MB | Reasonable for mobile data download |

---

## Scalability Considerations

### **Current (MVP) Limits**
- Users: 1 per device (no multi-user)
- Sessions: ~500 logged sessions before performance review
- Database size: ~10MB typical (50MB max before optimization)

### **Future Scale Path**
1. **Local optimization:** Archival of old sessions (> 1 year)
2. **Cloud sync (optional):** Firebase/Supabase for cross-device
3. **Multi-user:** Add user_id foreign keys (already in schema)

---

## Build & Deployment

### **Development Build**
```bash
# Install dependencies
npm install

# Start dev server (Mac testing)
npx expo start

# Run on Android emulator
npx expo run:android

# Run on physical device
# Scan QR code with Expo Go app
```

### **Production Build (APK)**
```bash
# Configure EAS
eas build:configure

# Build Android APK
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### **Testing Distribution**
- **Internal:** EAS Build → Download APK → Install via ADB
- **Beta:** Google Play Internal Testing track
- **Production:** Google Play staged rollout (10% → 50% → 100%)

---

## Dependencies (Key Packages)

```json
{
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
}
```

---

## Tech Debt & Known Limitations (MVP)

| Item | Impact | Mitigation Plan |
|------|--------|-----------------|
| No automated tests | High | Add Jest tests in v1.1 |
| Hardcoded programs | Medium | Move to JSON/SQLite in v1.2 |
| No database migrations | Medium | Implement migration system pre-v2 |
| Single-user only | Low | Schema ready for multi-user |
| No offline-to-online sync | Low | Deferred to cloud feature (v2+) |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-10-23 | React Native + Expo | Best cross-platform + AI support |
| 2025-10-23 | SQLite over AsyncStorage | Structured data, future-proof queries |
| 2025-10-23 | Zustand over Redux | Simpler for MVP, sufficient for state needs |
| 2025-10-23 | React Native Paper | Material Design 3, Android-first UI |
| 2025-10-23 | Defer Strava/Garmin | Not critical for MVP, architecture-ready |

---

## References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Strava API v3](https://developers.strava.com/)
- [Victory Native](https://commerce.nearform.com/open-source/victory-native/)
