# Product Requirements Document (PRD) - GI Diary

**Product Name:** GI Diary
**Version:** 1.0
**Date:** 2025-10-23
**Product Owner:** Sarah
**Status:** Draft → Review
**Project Type:** Greenfield (New Product)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-23 | Sarah (PO) | Initial PRD creation |

---

## Executive Summary

**GI Diary** er en offline-first, mobil-native Android-applikasjon designet for å hjelpe utholdenhetsidretsutøvere med å trene magen for optimal karbohydratinntak under trening og konkurranse. Appen kombinerer forskningsbaserte mage-treningsprogrammer med strukturert logging av næringinntak og ubehag, og gir datadrevet innsikt gjennom integrasjon med treningsdata fra Strava/Garmin.

**Kjerneverdi:** Gjør mage-trening målbart, enkelt og forskningsbasert - slik at utøvere kan optimalisere energiinntaket og unngå mage-problemer under konkurranser.

---

## 1. Product Vision & Goals

### 1.1 Vision Statement

> "Gjøre mage-trening like strukturert og målbart som fysisk trening - slik at ingen utøver mister en konkurranse på grunn av mage-problemer."

### 1.2 Product Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **G1: Strukturert Mage-trening** | Tilby forskningsbaserte programmer for progressiv karbohydrat-toleranse | 80% av brukere fullfører minst 1 program |
| **G2: Enkel Logging** | Gjøre logging av inntak og ubehag så enkelt at det kan gjøres under trening | < 5 sekunder per logging-hendelse |
| **G3: Datadrevet Innsikt** | Identifisere sammenhenger mellom inntak, intensitet og ubehag | 70% av brukere opplever "aha-øyeblikk" |
| **G4: Privacy-First** | All data lagres lokalt på brukerens enhet (GDPR-compliant by design) | 0 databrudd, 100% lokal lagring |
| **G5: Offline-Funksjonalitet** | Fungere uten internett-tilkobling (kritisk under økter) | 100% av kjernefeatures fungerer offline |

### 1.3 Target Audience

**Primary Persona: "Marit - Marathon Runner"**
- **Alder:** 35-45 år
- **Erfaring:** 3+ år med løping, 2-5 maratoner
- **Problem:** Kvalme og mage-kramper under lange økter, spesielt på race day
- **Mål:** Fullføre neste maraton uten mage-problemer
- **Tech Savviness:** Komfortabel med Strava, treningsklokke, mobilapper

**Secondary Persona: "Erik - Ultra Runner"**
- **Alder:** 30-50 år
- **Erfaring:** Ultra-distance (50k+)
- **Problem:** Kan ikke få i seg nok energi på lange løp (6-12 timer)
- **Mål:** Øke karbohydrat-inntak fra 40g/t til 90g/t
- **Tech Savviness:** Høy - bruker multiple tracking-apper

### 1.4 Out of Scope (Not MVP)

- ❌ iOS-versjon (kommer i v1.5+)
- ❌ Web-app / Desktop-versjon
- ❌ Cloud sync / Multi-device sync
- ❌ Social features (deling, community)
- ❌ Coaching / Ekspert-konsultasjon
- ❌ Integrering med Apple Health / Google Fit (v2.0+)
- ❌ Ernæringsanbefalinger utover karbohydrater
- ❌ Treningsprogrammer (kun mage-trening)

---

## 2. Problem Statement

### 2.1 User Pain Points

1. **Manglende Struktur**
   - Utøvere vet at mage-trening er viktig, men vet ikke hvordan de skal gjøre det systematisk
   - Ingen klare programmer eller progresjon

2. **Vanskelig å Huske**
   - Under en 2-4 timers økt er det vanskelig å huske nøyaktig hva man spiste og når
   - Ubehag oppstår, men brukeren husker ikke konteksten (intensitet, timing)

3. **Manglende Innsikt**
   - Brukere vet at de får vondt i magen, men vet ikke *hvorfor*
   - Ingen enkel måte å se sammenhenger mellom inntak, intensitet og ubehag

4. **Eksisterende Løsninger er Utilstrekkelige**
   - Strava/Garmin viser kun trening, ikke næring
   - Generiske ernæringsapper forstår ikke mage-trening
   - Notater i notesbøker er ustrukturerte og vanskelige å analysere

### 2.2 Market Gap

**Eksisterende konkurrenter:**
- MyFitnessPal: Fokus på kaloritelling, ikke timing eller mage-toleranse
- Strava: Kun treningsdata, ingen ernæring
- TrainingPeaks: Komplekst, dyrt, krever coach

**Vårt unike verditilbud:**
- Spesialisert på **mage-trening** (ikke generell ernæring)
- **Forskningsbasert** (Jeukendrup, gut training protocols)
- **Offline-first** (fungerer under økter)
- **Privacy-first** (ingen data i skyen)
- **Enkel** (laget for bruk under trening)

---

## 3. Product Overview

### 3.1 Product Type

**Platform:** Android mobile app (native-like via React Native + Expo)
**Deployment:** Google Play Store (APK)
**Pricing:** Gratis i MVP (mulig fremtidig premium-tier)
**Architecture:** Offline-first, lokal SQLite database

### 3.2 Key Features (MVP)

| Feature | Epic | Priority | Description |
|---------|------|----------|-------------|
| **Onboarding & Profil** | Epic 1 | P0 (Must-Have) | Velkomst-veiviser, samle mål og mage-problem, foreslå program |
| **Drivstoff-bibliotek** | Epic 2 | P0 (Must-Have) | Personlig "skafferi" med gel, drikke, mat - spesifiser karbohydrater |
| **Mage-treningsprogrammer** | Epic 3 | P0 (Must-Have) | Forskningsbaserte 4-8 ukers programmer med progresjon |
| **Økt-planlegging** | Epic 4 | P0 (Must-Have) | Lag ernæringsplan før økt basert på program og skafferi |
| **"Økt-modus"** | Epic 5 | P0 (Must-Have) | Timer, notifikasjoner, logging av inntak/ubehag under økt |
| **Analyse & Innsikt** | Epic 7 | P1 (Should-Have) | Visualiser sammenhenger, få anbefalinger |
| **Strava/Garmin integrasjon** | Epic 6 | P2 (Nice-to-Have) | Hent puls/høyde automatisk for analyse |

### 3.3 User Journey (Happy Path)

```
1. Onboarding
   User downloads app → Gjennomfører velkomst-veiviser
   → Velger mål ("Sub-3 maraton") + problem ("Kvalme")
   → Appen foreslår "4-Week Base Carb Training"
   → Profil opprettes

2. Forberedelse
   User legger til sine produkter i "Mitt Skafferi"
   → "Maurten Gel 100" (25g karbs)
   → "Precision Fuel 30" (30g karbs)
   → Starter program: "4-Week Base Carb Training"

3. Planlegging
   User velger dagens økt: "Uke 2, Økt 1: 75 min @ 45g/t"
   → Appen beregner: "Du trenger 56g karbs totalt"
   → Foreslår plan: "2x Maurten Gel + 1 flaske Precision Fuel"
   → User bekrefter plan

4. Under Økt
   User starter "Økt-modus" → Timer starter
   → Etter 30 min: Notifikasjon "Ta Maurten Gel"
   → User trykker stor "Inntak"-knapp → Logget
   → Etter 60 min: User føler ubehag → Trykker "Ubehag"-knapp → Velger nivå 3/5
   → Økt avsluttes: "Avslutt økt"-knapp → Data lagres

5. Analyse
   User åpner analyse-skjerm
   → Ser graf: Puls-kurve med røde markører (ubehag)
   → Innsikt: "Ubehag (3/5) skjedde i Sone 4 (høy intensitet)"
   → Anbefaling: "Prøv å ta inntak 10 min FØR høy intensitet neste gang"
   → User legger til notat: "Sov dårlig natten før - kan ha påvirket"

6. Progresjon
   User fortsetter program gjennom 4 uker
   → Ser forbedring: Mindre ubehag, høyere inntak
   → Når målet: 60g/t uten ubehag
   → Klar for maraton!
```

---

## 4. Functional Requirements

For detaljerte funksjonsdetaljer, se sharded Epic-dokumenter:

- [Epic 1: Onboarding og Profiloppsett](./prd/epic-1-onboarding.md)
- [Epic 2: Drivstoff-bibliotek](./prd/epic-2-fuel-library.md)
- [Epic 3: Mage-treningsprogrammer](./prd/epic-3-programs.md)
- [Epic 4: Økt-planlegging](./prd/epic-4-planning.md)
- [Epic 5: "Økt-modus"](./prd/epic-5-session-mode.md)
- [Epic 6: Tredjeparts-integrasjoner](./prd/epic-6-integrations.md) *(Ikke MVP)*
- [Epic 7: Analyse og Innsikt](./prd/epic-7-analysis.md)

### 4.1 Epic Prioritization

| Epic | Priority | MVP? | Estimated Complexity | Dependencies |
|------|----------|------|---------------------|--------------|
| Epic 1: Onboarding | P0 | ✅ Yes | Low | None |
| Epic 2: Fuel Library | P0 | ✅ Yes | Low | Epic 1 |
| Epic 3: Programs | P0 | ✅ Yes | Medium | Epic 1 |
| Epic 4: Planning | P0 | ✅ Yes | Medium | Epic 2, Epic 3 |
| Epic 5: Økt-modus | P0 | ✅ Yes | High | Epic 4 |
| Epic 7: Analysis | P1 | ✅ Yes | High | Epic 5 |
| Epic 6: Integrations | P2 | ❌ No (v1.1+) | High | Epic 5 |

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **App Launch Time** | < 2 seconds | Native-app feel |
| **Database Query** | < 50ms | Smooth UI interactions |
| **Timer Accuracy** | ± 1 second | Acceptable for nutrition timing |
| **Chart Rendering** | < 500ms | Acceptable for analysis view |
| **APK Size** | < 50MB | Mobile data download acceptable |
| **Battery Usage** | < 10% drain per hour (active session) | Critical for long sessions |

### 5.2 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **Data Persistence** | 100% (zero data loss) | Auto-save every 30s + crash recovery |
| **Offline Availability** | 100% of core features | SQLite local database |
| **Background Timer Stability** | 4+ hours continuous | expo-task-manager + foreground service |
| **App Crash Recovery** | 100% session recovery | Session recovery module (Winston's implementation) |

### 5.3 Security & Privacy

| Requirement | Implementation | GDPR Compliance |
|-------------|----------------|-----------------|
| **Data Location** | 100% on-device (SQLite) | ✅ Yes |
| **No Cloud Storage** | All data local (no backend) | ✅ Yes |
| **Data Export** | CSV/JSON export functionality | ✅ Yes (Right to Portability) |
| **Data Deletion** | Soft deletes + hard delete option | ✅ Yes (Right to Erasure) |
| **OAuth Tokens** | expo-secure-store (AES-256) | ✅ Yes |
| **Database Encryption** | Optional (SQLCipher for v1.1+) | ✅ Enhanced privacy |

### 5.4 Usability

| Requirement | Target | Design Principle |
|-------------|--------|-----------------|
| **Onboarding Time** | < 2 minutes | Minimal friction |
| **Logging Speed (Økt-modus)** | < 5 seconds per event | One-tap actions |
| **Learning Curve** | < 10 minutes to first session | Intuitive UI |
| **Accessibility** | WCAG AA compliance | Material Design 3 standards |
| **Language** | Norwegian (primary), English (v1.1) | Localized for target market |

### 5.5 Scalability

| Metric | MVP Limit | Future Scale |
|--------|-----------|--------------|
| **Users per Device** | 1 | Multi-user (v2.0) |
| **Sessions Logged** | 500 | Unlimited with archival |
| **Database Size** | 50MB | 500MB+ with optimization |
| **Fuel Products** | 100 | Unlimited |

---

## 6. Technical Constraints

### 6.1 Platform

- **Primary:** Android 8.0+ (API level 26+)
- **Future:** iOS 13+ (v1.5+)
- **Screen Sizes:** Phone only (no tablet optimization in MVP)

### 6.2 Technology Stack

See: [Architecture Documentation](../architecture/tech-stack.md)

**Summary:**
- **Framework:** React Native + Expo SDK 52+
- **Language:** TypeScript (strict mode)
- **Database:** SQLite 3.x (expo-sqlite)
- **State Management:** Zustand
- **UI Framework:** React Native Paper (Material Design 3)
- **Charts:** Victory Native
- **Build:** Expo Application Services (EAS)

### 6.3 Dependencies

**Third-Party Services (Optional, not MVP):**
- Strava API v3 (OAuth 2.0 PKCE)
- Garmin Connect API (OAuth 1.0a)

**Device APIs:**
- expo-notifications (intake reminders)
- expo-task-manager (background timer)
- expo-secure-store (OAuth tokens)
- expo-haptics (vibration feedback)

---

## 7. Success Metrics (KPIs)

### 7.1 MVP Launch Metrics (Week 1-4)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **App Installs** | 50 beta users | Google Play Console |
| **Onboarding Completion** | 80% | Analytics event tracking |
| **First Session Logged** | 60% of onboarded users | Database query |
| **Crash-Free Rate** | 99%+ | Expo crash reporting |
| **Session Recovery Success** | 100% (critical!) | Manual testing + user feedback |

### 7.2 Product-Market Fit Metrics (Month 1-3)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Weekly Active Users (WAU)** | 70% retention | Analytics |
| **Program Completion** | 50% complete ≥1 program | Database query |
| **Sessions Logged per User** | Average 8+ sessions | Database query |
| **Perceived Value** | 8/10 NPS score | In-app survey |
| **Feature Usage** | 80% use Økt-modus, 60% use Analysis | Analytics |

### 7.3 Business Metrics (Future)

| Metric | Target | Timeline |
|--------|--------|----------|
| **User Growth** | 1000 active users | Month 6 |
| **Organic Referrals** | 20% of installs | Month 6 |
| **Premium Conversion** | 10% (if premium tier added) | Month 12 |

---

## 8. Risks & Mitigations

### 8.1 Critical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Background Timer Fails (>2 hours)** | 🔴 CRITICAL | Medium | PoC testing (4-hour test), fallback to silent audio trick |
| **Data Loss on Crash** | 🔴 CRITICAL | Low | Crash recovery module (implemented by Winston) |
| **Strava OAuth Complexity** | 🟡 MEDIUM | Medium | Start with manual GPX upload as fallback |
| **Battery Drain** | 🟡 MEDIUM | Medium | Optimize timer, use foreground service efficiently |
| **Low User Adoption** | 🟡 MEDIUM | Medium | Beta with target audience, iterate based on feedback |

### 8.2 Technical Debt Accepted for MVP

| Item | Impact | Plan |
|------|--------|------|
| No automated tests | 🟡 Medium | Add Jest tests in v1.1 |
| Hardcoded programs | 🟢 Low | Move to JSON/SQLite in v1.2 |
| Single-user only | 🟢 Low | Schema ready for multi-user (v2.0) |
| No biometric lock | 🟡 Medium | Add in v1.1 |
| Basic insight rules | 🟢 Low | LLM-powered insights in v2.0 |

---

## 9. Go-to-Market Strategy (MVP)

### 9.1 Launch Plan

**Phase 1: Closed Beta (Week 1-2)**
- 10-20 selected ultra/marathon runners
- Manual APK distribution
- Daily feedback loops
- Focus: Stability, crash recovery, usability

**Phase 2: Open Beta (Week 3-4)**
- 50-100 users via running communities (Kondis, Facebook groups)
- Google Play Internal Testing track
- Focus: Feature validation, NPS scoring

**Phase 3: Public Launch (Week 5+)**
- Google Play Store (free tier)
- PR: Article in Kondis magazine
- Social: Instagram posts with influencers (løpe-influensere)
- Focus: Growth, retention

### 9.2 Positioning

**Tagline:** "Tren magen din som du trener kroppen"

**Key Messages:**
- Forskningsbasert (Jeukendrup gut training)
- Privacy-first (din data, din mobil)
- Enkelt å bruke (selv under trening)
- Gratis å prøve

---

## 10. Roadmap

### 10.1 MVP (v1.0) - Week 1-8

✅ Epic 1: Onboarding
✅ Epic 2: Fuel Library
✅ Epic 3: Programs
✅ Epic 4: Planning
✅ Epic 5: Økt-modus
✅ Epic 7: Analysis
❌ Epic 6: Integrations (deferred)

### 10.2 Post-MVP (v1.1-v1.5)

**v1.1 (Month 2-3):**
- Biometric app lock
- Automated tests (Jest)
- English language support
- Bug fixes & polish

**v1.2 (Month 4-5):**
- Epic 6: Strava/Garmin integration
- Custom programs (user-created)
- Export to CSV/JSON

**v1.5 (Month 6-9):**
- iOS version (same codebase)
- Apple Health / Google Fit integration
- Social features (share progress)

**v2.0 (Month 10-12):**
- LLM-powered insights (OpenAI/Anthropic)
- Optional cloud sync (Firebase/Supabase)
- Premium tier (advanced analytics)

---

## 11. Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| **Product Owner** | Sarah | Requirements, prioritization, acceptance |
| **Architect** | Winston | Technical architecture, infrastructure |
| **Business Analyst** | Mary | Market research, user needs |
| **Developer (AI-assisted)** | User + AI | Implementation |
| **QA** | TBD | Testing, quality assurance |
| **Users (Beta)** | Marathon/Ultra runners | Feedback, validation |

---

## 12. Definitions & Glossary

| Term | Definition |
|------|------------|
| **GI** | Gastrointestinal (mage-tarm) |
| **Carb Training** | Gut training - progressiv tilvenning til høyere karbohydrat-inntak |
| **Økt-modus** | Active session mode - timer + logging under trening |
| **Skafferi** | Fuel library - brukerens personlige drivstoff-bibliotek |
| **Epic** | Large feature set (collection of user stories) |
| **User Story** | Specific user requirement ("As a user, I want...") |
| **MVP** | Minimum Viable Product - minste funksjonelle produkt |
| **Offline-first** | App fungerer uten internett, syncer senere (optional) |
| **PKCE** | Proof Key for Code Exchange - OAuth flow uten backend |

---

## 13. Appendices

### A. Research References

- Jeukendrup, A. (2014). "A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise"
- Costa et al. (2017). "Systematic review: exercise-induced gastrointestinal syndrome"
- Jeukendrup, A. (2017). "Training the Gut for Athletes"

### B. Related Documents

- [Architecture Documentation](../architecture/tech-stack.md)
- [Database Schema](../architecture/database-schema.md)
- [Epic-to-Architecture Mapping](../architecture/epic-mapping.md)
- [Architect Review](../architecture/ARCHITECT_REVIEW.md)

### C. Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-10-23 | 1.0 | Sarah (PO) | Initial PRD creation based on Mary & Winston's work |

---

## 14. Approval

**Status:** ✅ Draft Complete - Pending Review

**Next Steps:**
1. Review PRD with stakeholders
2. Create detailed Epic documents (sharded)
3. Create User Stories per Epic
4. Run PO Master Checklist validation
5. Approve for development

---

**Document Owner:** Sarah (Product Owner)
**Last Updated:** 2025-10-23
**Next Review:** Before development start

---

*This PRD is a living document and will be updated as the product evolves.*
