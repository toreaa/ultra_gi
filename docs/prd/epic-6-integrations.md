# Epic 6: Tredjeparts-integrasjoner (Strava/Garmin)

**Epic ID:** EPIC-6
**Epic Name:** Tredjeparts-integrasjoner (Strava/Garmin)
**Priority:** P2 (Nice-to-Have) - **NOT MVP**
**Status:** Deferred to v1.1+
**Estimated Complexity:** High
**Dependencies:** Epic 5 (Session Mode)

---

## Epic Description

Som en bruker vil jeg kunne koble appen til mine Strava- eller Garmin-kontoer, slik at jeg automatisk kan hente treningsdata (puls, watt, fart) og korrelere dette med mage-ubehag og inntak.

**Business Value:**
- Eliminerer manuell input av treningsdata
- Gjør analyse mer nøyaktig (faktisk HR/watt vs selvrapportert intensitet)
- Differensiator vs papirdagbok
- Økt verdi for seriøse utøvere

**⚠️ IMPORTANT:**
- Dette er **IKKE MVP** - appen fungerer uten integrasjoner
- Epic 7 (Analyse) kan gi verdi uten eksterne data
- Implementeres i v1.1+ når kjerneprodukt er validert

---

## User Stories

### **Story 6.1: Koble til Strava/Garmin**

**Som** en bruker
**vil jeg** kunne koble min Strava- eller Garmin-konto til appen
**slik at** jeg kan hente treningsdata automatisk

**Acceptance Criteria:**
- [ ] "Integrasjoner"-skjerm tilgjengelig fra Settings
- [ ] Liste over tilgjengelige integrasjoner:
  - Strava (ikon + status: "Ikke tilkoblet")
  - Garmin Connect (ikon + status: "Ikke tilkoblet")
- [ ] Trykk på "Koble til Strava" → OAuth PKCE-flyt:
  - Åpne Strava authorization i nettleser
  - Bruker godkjenner tilgang (scope: activity:read_all)
  - Redirect tilbake til app med authorization code
  - Exchange code for access + refresh tokens
  - Lagre tokens i expo-secure-store (kryptert)
  - Status endres til "✓ Tilkoblet"
- [ ] Samme flyt for Garmin Connect
- [ ] Vis tilkoblet brukerinfo:
  - Navn
  - Profilbilde
  - Tilkoblet dato
- [ ] "Koble fra"-knapp:
  - Bekreftelsesdialog
  - Slett tokens fra secure storage
  - Status → "Ikke tilkoblet"

**Technical Notes:**
- Screen: `src/screens/integrations/IntegrationsScreen.tsx`
- Service: `src/services/oauth/stravaAuth.ts`, `garminAuth.ts`
- API: expo-auth-session (PKCE flow)
- Storage: expo-secure-store for tokens
- Database: `external_integrations` table (user_id, provider, access_token_encrypted, refresh_token_encrypted, expires_at)

---

### **Story 6.2: Automatisk hent aktiviteter**

**Som** en bruker
**vil jeg** at appen automatisk skal hente nye treningsaktiviteter fra Strava/Garmin
**slik at** jeg slipper å manuelt synce

**Acceptance Criteria:**
- [ ] Automatisk fetch ved app-oppstart (hvis tilkoblet)
- [ ] Manuell "Synkroniser nå"-knapp i Integrasjoner-skjerm
- [ ] Fetch kun aktiviteter fra siste 30 dager (performance)
- [ ] Støttede aktivitetstyper:
  - Run
  - Ride
  - VirtualRide (Zwift)
  - Workout (Garmin)
- [ ] For hver aktivitet, hent:
  - Aktivitets-ID (ekstern ID)
  - Navn (f.eks. "Morning Run")
  - Dato og tid (start)
  - Varighet (sekunder)
  - Type (Run, Ride, etc.)
  - Gjennomsnittspuls (hvis tilgjengelig)
  - Gjennomsnittswatt (hvis tilgjengelig)
  - Distance (meter)
- [ ] Lagre i `external_activities` table
- [ ] Duplikatsjekk: Ikke lagre samme aktivitet to ganger (sjekk external_id)
- [ ] Progress indicator under synkronisering
- [ ] Toast ved fullført: "✓ 12 aktiviteter synkronisert"
- [ ] Feilhåndtering:
  - Token utløpt → Refresh token
  - API rate limit → Vis melding, prøv igjen senere
  - Ingen internett → Vis feilmelding

**Technical Notes:**
- Service: `src/services/activitySync.ts`
- Strava API: GET `/athlete/activities?after={timestamp}`
- Garmin API: GET `/activitylist-service/activities/search/activities`
- Repository: `ExternalActivityRepository.upsert()`
- Database: INSERT OR IGNORE INTO `external_activities`
- Background: Ikke synkroniser i bakgrunnen (kun manuelt/ved oppstart)

---

### **Story 6.3: Lagre tidsserie-data**

**Som** en bruker
**vil jeg** at appen skal hente detaljert tidsserie-data (hvert sekund: puls, watt, fart)
**slik at** jeg kan korrelere dette med inntak og ubehag på sekundnivå

**Acceptance Criteria:**
- [ ] For hver aktivitet, hent streams (tidsserier):
  - time (seconds from start)
  - heartrate (bpm)
  - watts (if power meter)
  - velocity_smooth (m/s)
  - altitude (m)
- [ ] Strava Streams API: GET `/activities/{id}/streams`
- [ ] Garmin API: GET `/wellness-service/wellness/dailyHeartRate/{date}`
- [ ] Lagre i `activity_timeseries` table:
  ```sql
  CREATE TABLE activity_timeseries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    timestamp_offset_seconds INTEGER NOT NULL,
    heartrate INTEGER,
    watts INTEGER,
    velocity_mps REAL,
    altitude_m REAL,
    FOREIGN KEY (activity_id) REFERENCES external_activities(id)
  );
  ```
- [ ] Komprimering (optional for MVP):
  - Ikke lagre hvert sekund hvis ingen endring
  - Eller sample hver 5. sekund (600 datapunkter per time)
- [ ] Fetch streams kun når bruker trenger dem (lazy load):
  - F.eks. når bruker åpner Epic 7 korrelasjonsgraf
- [ ] Progress indicator under fetch (kan ta 10-30s for lange aktiviteter)
- [ ] Feilhåndtering: Hvis streams ikke tilgjengelig, logg warning (ikke crash)

**Technical Notes:**
- Service: `src/services/activityStreams.ts`
- API:
  - Strava: GET `/activities/{id}/streams?keys=time,heartrate,watts,velocity_smooth`
  - Garmin: Mer kompleks, krever flere API-kall
- Repository: `ActivityTimeseriesRepository.bulkInsert()`
- Database: Batch INSERT for performance (1000+ rows per aktivitet)

---

## User Flow Diagram

```
[Settings → Integrasjoner]
       ↓
[Trykk "Koble til Strava"] (Story 6.1)
       ↓
[OAuth PKCE-flyt i nettleser]
       ↓
[Redirect tilbake → Tokens lagret]
       ↓
[Status: "✓ Tilkoblet"]
       ↓
[Trykk "Synkroniser nå"] (Story 6.2)
       ↓
[Fetch aktiviteter (siste 30 dager)]
       ↓
[Lagre i external_activities]
       ↓
[Toast: "✓ 12 aktiviteter synkronisert"]
       ↓
[Gå til Epic 7: Analyse]
       ↓
[Velg aktivitet → Fetch streams] (Story 6.3)
       ↓
[Korrelasjonsgraf vises med HR/watt + inntak/ubehag]
```

---

## Technical Architecture

### Database Schema

```sql
-- external_integrations table
CREATE TABLE external_integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  provider TEXT NOT NULL,           -- 'strava' | 'garmin'
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  expires_at TEXT NOT NULL,
  athlete_id TEXT,                  -- External athlete ID
  athlete_name TEXT,
  connected_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- external_activities table (already exists in schema)
CREATE TABLE external_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  integration_id INTEGER NOT NULL,
  external_id TEXT NOT NULL,        -- Strava/Garmin activity ID
  activity_name TEXT,
  activity_type TEXT NOT NULL,      -- 'run', 'ride', etc.
  start_time TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  distance_meters INTEGER,
  avg_heartrate INTEGER,
  avg_watts INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (integration_id) REFERENCES external_integrations(id),
  UNIQUE(integration_id, external_id)
);

-- activity_timeseries table (NEW)
CREATE TABLE activity_timeseries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_id INTEGER NOT NULL,
  timestamp_offset_seconds INTEGER NOT NULL,
  heartrate INTEGER,
  watts INTEGER,
  velocity_mps REAL,
  altitude_m REAL,
  FOREIGN KEY (activity_id) REFERENCES external_activities(id) ON DELETE CASCADE
);

CREATE INDEX idx_timeseries_activity ON activity_timeseries(activity_id, timestamp_offset_seconds);
```

### OAuth PKCE Implementation

```typescript
// src/services/oauth/stravaAuth.ts
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

const STRAVA_CLIENT_ID = '123456'; // From environment
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

export async function authenticateWithStrava(): Promise<void> {
  // Generate PKCE challenge
  const codeChallenge = await AuthSession.generateCodeChallengeAsync();

  // Start OAuth flow
  const result = await AuthSession.startAsync({
    authUrl: `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=activity:read_all&code_challenge=${codeChallenge.codeChallenge}&code_challenge_method=S256`,
  });

  if (result.type === 'success') {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(result.params.code, codeChallenge.codeVerifier);

    // Store tokens securely
    await SecureStore.setItemAsync('strava_access_token', tokens.access_token);
    await SecureStore.setItemAsync('strava_refresh_token', tokens.refresh_token);

    // Save to database
    await ExternalIntegrationRepository.create({
      user_id: 1,
      provider: 'strava',
      access_token_encrypted: tokens.access_token,
      refresh_token_encrypted: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at * 1000).toISOString(),
      athlete_id: tokens.athlete.id.toString(),
      athlete_name: tokens.athlete.firstname + ' ' + tokens.athlete.lastname,
    });
  }
}

async function exchangeCodeForTokens(code: string, verifier: string): Promise<StravaTokens> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });
  return response.json();
}
```

### Activity Sync Service

```typescript
// src/services/activitySync.ts

export async function syncActivities(userId: number, provider: 'strava' | 'garmin'): Promise<number> {
  const integration = await ExternalIntegrationRepository.getByProvider(userId, provider);
  if (!integration) throw new Error('Not connected');

  // Fetch activities from last 30 days
  const after = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
  const activities = await fetchStravaActivities(integration.access_token_encrypted, after);

  // Upsert to database (avoid duplicates)
  let count = 0;
  for (const activity of activities) {
    const inserted = await ExternalActivityRepository.upsert({
      user_id: userId,
      integration_id: integration.id,
      external_id: activity.id.toString(),
      activity_name: activity.name,
      activity_type: activity.type.toLowerCase(),
      start_time: activity.start_date,
      duration_seconds: activity.elapsed_time,
      distance_meters: activity.distance,
      avg_heartrate: activity.average_heartrate,
      avg_watts: activity.average_watts,
    });
    if (inserted) count++;
  }

  return count;
}

async function fetchStravaActivities(accessToken: string, after: number): Promise<StravaActivity[]> {
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.json();
}
```

---

## Critical Testing Scenarios

### OAuth Test
1. Trykk "Koble til Strava"
2. Omdirigeres til Strava.com
3. Godkjenn tilgang
4. Omdirigeres tilbake til app
5. **Pass:** Status viser "✓ Tilkoblet", brukerinfo vises

### Sync Test
1. Koble til Strava (med konto som har 10+ aktiviteter)
2. Trykk "Synkroniser nå"
3. Vent 5-10s
4. **Pass:** Toast viser "✓ 10 aktiviteter synkronisert"
5. Sjekk database → activities lagret med korrekt data

### Token Refresh Test
1. Simuler utløpt access token (endre expires_at til fortid)
2. Trykk "Synkroniser nå"
3. **Pass:** Appen refresher token automatisk, synkronisering lykkes

### Streams Test
1. Synkroniser aktiviteter
2. Gå til Epic 7 analyse
3. Velg aktivitet → Vis korrelasjonsgraf
4. **Pass:** Fetch streams (kan ta 10-30s), graf vises med HR/watt

---

## Definition of Done

- [ ] Alle 3 User Stories implementert
- [ ] OAuth PKCE-flyt fungerer for Strava
- [ ] OAuth PKCE-flyt fungerer for Garmin (eller dokumentert som deferred)
- [ ] Tokens lagres kryptert i expo-secure-store
- [ ] Aktiviteter synkroniseres korrekt (duplikatsjekk)
- [ ] Streams lagres i database (activity_timeseries)
- [ ] Token refresh fungerer automatisk
- [ ] Feilhåndtering for rate limits og utløpte tokens
- [ ] UI matcher Material Design 3
- [ ] Manuell testing med ekte Strava/Garmin-kontoer
- [ ] Dokumentert API rate limits (Strava: 100 req/15min, 1000/day)

---

## Non-Functional Requirements

| Requirement | Target | Test Method |
|-------------|--------|-------------|
| OAuth security | PKCE flow, encrypted storage | Security audit |
| API rate limits | Respect Strava/Garmin limits | Rate limit test |
| Sync speed | < 30s for 100 activities | Performance test |
| Token refresh | Automatic, no user prompt | Expired token test |
| Error handling | Graceful degradation | Network failure test |

---

## Future Enhancements (Post-v1.1)

- [ ] Automatisk bakgrunns-synkronisering (daglig)
- [ ] Webhooks fra Strava (instant sync)
- [ ] Flere integrasjoner (Polar, Suunto, Wahoo)
- [ ] Auto-match aktivitet til session_log (tid + varighet)
- [ ] Import historisk data (siste 6 måneder)
- [ ] Sync tilbake til Strava (legg til karb-inntak i notater)

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Architecture Complete - **DEFERRED TO v1.1+ (NOT MVP)**

**⚠️ CRITICAL NOTE:** Epic 6 er IKKE nødvendig for MVP. Epic 7 (Analyse) kan gi verdi uten eksterne data. Implementer kun hvis tid og ressurser tillater det ETTER Epic 1-5 er validert i produksjon.
