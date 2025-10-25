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

- **Node.js 18+** (recommended: 20.x LTS)
- **npm 9+** or yarn
- **Android Studio** with Android SDK (for emulator)
- **Expo Go app** (for physical device testing)
- **Git** for version control

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd ultra_gi

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development server
npx expo start

# 5. Run on Android emulator (press 'a' in terminal)
# OR scan QR code with Expo Go app on your phone
```

### First-Time Setup Issues?

If you encounter errors after `npm install`:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# If using Mac M1/M2, you may need:
arch -x86_64 npm install
```

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires emulator)
npm run e2e

# Setup test data
npm run test-data:setup
```

See `docs/testing/AUTOMATION_GUIDE.md` for complete testing documentation.

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
