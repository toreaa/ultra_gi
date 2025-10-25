# GI Diary - Quick Start Guide

**Goal:** Get the app running on Android in < 30 minutes

---

## Prerequisites ✅

- [x] Node.js 18+ installed
- [x] Mac with Android Studio OR Android device with Expo Go app
- [x] Git (for version control)

---

## Setup Steps

### 1️⃣ Install Expo CLI (2 min)

```bash
cd /Users/torelindbergabodsvik/ultra_gi

# Install Expo globally
npm install -g expo-cli eas-cli

# Verify installation
expo --version
```

### 2️⃣ Initialize Expo Project (3 min)

```bash
# Create blank TypeScript Expo app
npx create-expo-app@latest . --template blank-typescript

# Answer prompts:
# - Overwrite files? Yes
# - Use TypeScript? Yes
```

### 3️⃣ Install Dependencies (5 min)

```bash
# Core mobile dependencies
npx expo install expo-sqlite react-native-paper expo-router

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State & Forms
npm install zustand react-hook-form zod

# Charts & Utilities
npm install victory-native date-fns

# Device APIs
npx expo install expo-notifications expo-task-manager expo-secure-store expo-haptics

# Dev tools
npm install --save-dev @types/react @types/react-native eslint prettier
```

### 4️⃣ Update app.json (2 min)

Replace contents with:

```json
{
  "expo": {
    "name": "GI Diary",
    "slug": "gi-diary",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "platforms": ["android"],
    "android": {
      "package": "com.ultragi.gidiary",
      "versionCode": 1,
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

### 5️⃣ Test Setup (5 min)

```bash
# Start Expo dev server
npx expo start

# Choose one:
# Option A: Press 'a' for Android emulator (requires Android Studio)
# Option B: Scan QR code with Expo Go app on Android phone
```

**Expected output:**
```
› Metro waiting on exp://192.168.1.x:8081
› Scan the QR code above with Expo Go (Android)
```

---

## Testing Options

### Option A: Android Emulator (Recommended for Development)

1. Install Android Studio
2. Create Virtual Device (Pixel 6, API 34)
3. Start emulator
4. Press 'a' in Expo terminal

### Option B: Physical Device (Fastest for Testing)

1. Install "Expo Go" from Google Play Store
2. Connect to same WiFi as your Mac
3. Scan QR code from `npx expo start`

---

## First Feature: Epic 1 (Onboarding)

Create your first screen:

```typescript
// src/screens/onboarding/WelcomeScreen.tsx
import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export const WelcomeScreen: FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="displayMedium">Welcome to GI Diary</Text>
      <Text variant="bodyLarge">Track your gut training journey</Text>
      <Button mode="contained" onPress={() => console.log('Start!')}>
        Get Started
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
```

---

## Troubleshooting

### "Command not found: expo"
```bash
npm install -g expo-cli
```

### "Module not found: expo-sqlite"
```bash
npx expo install expo-sqlite
```

### Metro bundler port conflict
```bash
npx expo start --clear
```

### Android emulator not starting
- Open Android Studio → Tools → AVD Manager → Start emulator manually

---

## Next Steps

Once running:

1. ✅ Verify app loads (blank white screen is OK)
2. 📖 Read `ARCHITECTURE_SUMMARY.md` for overview
3. 🏗️ Follow Epic 1 implementation (Onboarding screens)
4. 📊 Set up database initialization
5. 🎨 Build Fuel Library UI (Epic 2)

---

## Architecture Docs

| File | Purpose |
|------|---------|
| `ARCHITECTURE_SUMMARY.md` | High-level overview, roadmap |
| `docs/architecture/tech-stack.md` | Technology decisions |
| `docs/architecture/database-schema.md` | SQLite schema reference |
| `docs/architecture/source-tree.md` | File organization |
| `docs/architecture/coding-standards.md` | Code style guide |

---

## Useful Commands

```bash
# Start dev server
npx expo start

# Clear cache
npx expo start --clear

# Run on Android emulator
npx expo run:android

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build production APK (later)
eas build --platform android --profile production
```

---

**Status:** Ready to code! 🚀

**Estimated time to first screen:** 15-20 minutes after dependencies install
