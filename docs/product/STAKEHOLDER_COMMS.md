# Stakeholder Communication Plan - GI Diary

**Version:** 1.0
**Created:** 2025-10-24
**Owner:** John (Product Manager) 📊
**Status:** Active

---

## 🎯 Purpose

This document defines **how, when, and what we communicate** to stakeholders during GI Diary development and launch.

**Goal:** Keep everyone informed, aligned, and excited about progress without creating communication overhead.

---

## 👥 Stakeholder Map

### **Internal Stakeholders**

#### **1. Sarah (Product Owner)** 🎯
- **Role:** Strategic owner, prioritization, Go/No-Go decisions
- **Interest:** Product vision, roadmap alignment, ROI
- **Involvement:** High (weekly updates, sprint demos)

#### **2. Dev Team** 💻
- **Role:** Implementation, technical decisions
- **Interest:** Requirements clarity, technical feasibility, workload
- **Involvement:** Daily (stand-ups, sprint planning)

#### **3. Bob (Scrum Master)** 🏃
- **Role:** Process facilitation, blocker removal
- **Interest:** Sprint velocity, team health, delivery dates
- **Involvement:** Daily (stand-ups, sprint planning)

#### **4. Quinn (QA)** 🎯
- **Role:** Quality assurance, test strategy
- **Interest:** Test coverage, bug reports, quality metrics
- **Involvement:** High (sprint testing, bug triage)

#### **5. Winston (Architect)** 🏗️
- **Role:** Technical architecture, infrastructure
- **Interest:** Tech debt, performance, scalability
- **Involvement:** Medium (architecture reviews, POCs)

#### **6. UX Designer** 🎨
- **Role:** UI/UX design, user research
- **Interest:** Design consistency, user feedback
- **Involvement:** Low-Medium (design reviews, user testing)

---

### **External Stakeholders**

#### **7. Beta Testers (5-10 users)** 🧪
- **Role:** Early adopters, feedback providers
- **Interest:** App functionality, bug reports, feature requests
- **Involvement:** High (weekly testing, feedback surveys)

#### **8. Target Personas (Marit & Erik)** 🏃‍♀️🏃‍♂️
- **Role:** Real-world users, validation of product-market fit
- **Interest:** Solving GI problems, easy-to-use app
- **Involvement:** Medium (user interviews, beta testing)

#### **9. Leadership / Company** 🏢
- **Role:** Budget approval, strategic alignment
- **Interest:** ROI, timeline, resource allocation
- **Involvement:** Low (monthly updates, major milestones)

---

## 📅 Communication Cadence

### **Daily Communication**

#### **Daily Stand-up (Dev Team + Bob + John)**
- **When:** Every workday at 9:00 AM (15 minutes)
- **Who:** Dev Team, Bob (SM), John (PM)
- **Format:** Synchronous (video call or in-person)
- **Agenda:**
  1. What did you do yesterday?
  2. What will you do today?
  3. Any blockers?

**John's role:** Listen, note blockers, escalate to Sarah if needed.

---

### **Weekly Communication**

#### **1. Weekly Metrics Report (John → Sarah + Team)**
- **When:** Every Friday at 4:00 PM
- **Who:** John (author) → Sarah, Dev Team, Bob, Quinn, Winston
- **Format:** Email + Slack post
- **Content:**
  - Success metrics (G1-G5) - see `SUCCESS_METRICS.md`
  - Sprint progress (stories completed / total)
  - Key accomplishments this week
  - Blockers & risks
  - Next week's focus

**Template:** See `SUCCESS_METRICS.md` for report template.

---

#### **2. Beta Tester Update (John → Beta Testers)**
- **When:** Every Sunday at 6:00 PM (after MVP launch)
- **Who:** John (author) → Beta testers (email list)
- **Format:** Email newsletter
- **Content:**
  - New features released this week
  - Known bugs being fixed
  - Request for feedback
  - Teaser for next week

**Template:**
```
Subject: GI Diary Beta - Week X Update 🚀

Hi [Beta Tester],

Takk for at du tester GI Diary! Her er denne ukas oppdatering:

**🎉 Nye features:**
- [Feature 1]: [Description]
- [Feature 2]: [Description]

**🐛 Bugs vi fikser:**
- [Bug 1]: [Status]
- [Bug 2]: [Status]

**🙏 Trenger din hjelp:**
- [Feedback request]: [Link to survey]

**📅 Kommende uke:**
- [Preview of next sprint features]

Fortsatt spørsmål? Svar på denne emailen eller ping meg på Slack.

— John (Product Manager)
```

---

### **Bi-weekly Communication**

#### **Sprint Demo (Team → Sarah + Stakeholders)**
- **When:** End of each sprint (Week 2, 4, 6, 8, 10, 12)
- **Who:** Dev Team (presenters), Sarah, John, Bob, Quinn, Winston, UX Designer
- **Format:** 30-minute video call
- **Agenda:**
  1. **Sprint recap** (Bob) - 5 min
     - Stories completed
     - Velocity
     - Blockers resolved
  2. **Feature demo** (Dev Team) - 15 min
     - Live demo of new features
     - Show running app on emulator
  3. **Metrics update** (John) - 5 min
     - Success metrics progress
     - User feedback highlights
  4. **Q&A** - 5 min

**Recording:** Yes (shared on Slack for async viewing)

---

### **Monthly Communication**

#### **Executive Update (John → Leadership)**
- **When:** Last Friday of each month
- **Who:** John (author) → Leadership, Sarah (CC)
- **Format:** 1-page PDF + optional 15-min meeting
- **Content:**
  - High-level roadmap status
  - Budget vs. actuals (if applicable)
  - Key risks & mitigations
  - Next month's milestones

**Template:**
```
GI Diary - Executive Update (Month X)

**Status:** 🟢 On Track / 🟡 At Risk / 🔴 Blocked

**Progress:**
- Sprint X of Y completed
- X% of MVP features done
- X beta testers onboarded

**Key Accomplishments:**
1. [Major milestone achieved]
2. [Risk mitigated]

**Risks:**
- [Risk 1]: [Mitigation plan]

**Budget:**
- Spent: [Amount] / [Total Budget]
- Forecast: On budget / [% over/under]

**Next Month:**
- [Milestone 1]
- [Milestone 2]

**Decision Needed:**
- [Yes/No question for leadership]

— John (Product Manager)
```

---

### **Ad-Hoc Communication**

#### **Critical Blocker Alert (John → Sarah)**
- **When:** Immediately when critical blocker discovered
- **Who:** John → Sarah (direct message)
- **Format:** Slack DM or phone call
- **Trigger:** Any issue that delays sprint by > 1 week

**Example:**
```
Sarah - Critical Blocker Alert 🚨

**Issue:** Epic 5 Background Timer POC failed. Android kills app after 2 hours.

**Impact:** Cannot deliver Epic 5 as planned. 2-week delay or scope reduction needed.

**Options:**
1. Reduce max session to 2 hours (workaround)
2. Require foreground service (worse UX)
3. Research alternative solutions (2-week delay)

**Need Decision By:** Tomorrow (Sprint 4 starts Monday)

Can we jump on a quick call? — John
```

---

## 📊 Communication Channels

### **Primary Channels:**

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| **Slack #gi-diary** | Team chat, quick questions | < 2 hours (work hours) |
| **Email** | Formal updates, external stakeholders | < 24 hours |
| **Zoom/Meet** | Stand-ups, demos, meetings | Scheduled |
| **GitHub Issues** | Bug reports, feature requests | < 48 hours |
| **Google Drive** | Documents, reports, designs | Async |

---

### **Channel Guidelines:**

**Use Slack for:**
- ✅ Quick questions ("Where is the database schema?")
- ✅ Status updates ("Epic 1 done!")
- ✅ Informal discussions
- ✅ Celebrating wins 🎉

**Use Email for:**
- ✅ Weekly reports
- ✅ External stakeholders (beta testers)
- ✅ Formal decisions
- ✅ Monthly executive updates

**Use GitHub Issues for:**
- ✅ Bug reports
- ✅ Feature requests
- ✅ Technical discussions (with code references)

---

## 📝 Communication Templates

### **Template 1: Sprint Demo Invite**

```
Subject: GI Diary Sprint X Demo - [Date]

Hi Team,

Sprint X is wrapping up! Join us for a demo of the new features:

**When:** [Date] at [Time]
**Where:** [Zoom Link]
**Duration:** 30 minutes

**Agenda:**
1. Sprint recap (Bob)
2. Feature demo (Dev Team)
3. Metrics update (John)
4. Q&A

**Features to demo:**
- [Feature 1]
- [Feature 2]

Can't make it? Demo will be recorded and shared on Slack.

See you there! — John
```

---

### **Template 2: Feedback Request (Beta Testers)**

```
Subject: GI Diary Feedback Request - Help Us Improve! 🙏

Hi [Name],

Takk for at du tester GI Diary! Vi trenger din tilbakemelding for å gjøre appen bedre.

**5-Minute Survey:** [Link]

**Topics:**
- Hvor enkel var appen å bruke? (G2)
- Fikk du nyttig innsikt etter 5 økter? (G3)
- Hva skal vi forbedre?

**Incentive:** Alle som svarer får tidlig tilgang til v1.2 (Strava integration)!

Survey lukkes: [Date]

Tusen takk! — John (Product Manager)
```

---

### **Template 3: Blocker Escalation (John → Sarah)**

```
Subject: Blocker - Epic 5 Background Timer

Sarah,

Quick heads-up on a blocker:

**Issue:** [Brief description]
**Impact:** [Timeline impact]
**Options:** [2-3 options with pros/cons]
**Need Decision By:** [Date]

Can we sync on this? Available [time slots].

— John
```

---

## 🎯 Communication Principles

### **1. Transparency**
- Share both good news and bad news
- Don't hide blockers or risks
- Admit mistakes early

### **2. Brevity**
- Respect people's time
- Use bullet points, not paragraphs
- TL;DR at the top of long emails

### **3. Actionability**
- Every communication should have a clear ask or FYI
- Use "Decision Needed" or "FYI Only" in subject lines

### **4. Data-Driven**
- Use metrics (see `SUCCESS_METRICS.md`)
- Back opinions with evidence
- Show trends (↑↓→)

### **5. User-Centric**
- Always tie updates back to user value
- Share user feedback (quotes, survey results)
- Celebrate user wins ("Marit completed her first program!")

---

## 📅 Key Communication Milestones

| Milestone | Communication Event | Audience |
|-----------|---------------------|----------|
| Dev Team Assigned | Kickoff Meeting | Team, Sarah |
| Sprint 1 Complete | Demo + Metrics Report | Team, Sarah, Leadership |
| Epic 5 POC Result | Decision Meeting | Team, Sarah, Winston |
| MVP Beta Launch | Beta Invite Email | Beta Testers |
| Week 4 Feedback | Beta Survey Results | Team, Sarah |
| MVP Complete | Launch Announcement | All Stakeholders |
| v1.2 (Strava) | Feature Announcement | Beta Testers, Public |

---

## 🚧 Crisis Communication Plan

### **Scenario 1: Critical Bug in Production**

**Steps:**
1. **Immediate (< 1 hour):** John notifies Sarah + Dev Team via Slack
2. **Short-term (< 4 hours):** Dev Team investigates, John drafts user communication
3. **Medium-term (< 24 hours):** Hotfix released, John emails beta testers
4. **Long-term (< 1 week):** Post-mortem, process improvements

**User Communication Template:**
```
Subject: GI Diary - Critical Bug Fix Released

Hi [Beta Tester],

Vi oppdaget en kritisk bug i GI Diary som påvirket [feature].

**Hva skjedde:** [Brief technical explanation]
**Løsning:** [Fix deployed, update available]
**Dine data:** [Are safe / May be affected - here's how to recover]

**Neste steg:** [Update app / Clear cache / etc.]

Vi beklager ulempene. Spørsmål? Svar på denne emailen.

— John (Product Manager)
```

---

### **Scenario 2: Major Delay (> 2 weeks)**

**Steps:**
1. **Immediate:** John → Sarah meeting (identify cause, options)
2. **Short-term (< 2 days):** John updates roadmap, notifies team
3. **Medium-term (< 1 week):** John communicates revised timeline to stakeholders
4. **Long-term:** Retrospective, prevent future delays

**Stakeholder Communication Template:**
```
Subject: GI Diary Roadmap Update - Timeline Revision

Hi Team,

Vi må justere roadmapen for GI Diary grunnet [reason].

**Original Timeline:** MVP Release Week 12
**Revised Timeline:** MVP Release Week 14 (+2 weeks)

**Reason:** [Brief explanation]
**Mitigation:** [What we're doing to get back on track]

**Updated Milestones:**
- Sprint 4: [New date]
- Sprint 5: [New date]
- MVP Release: [New date]

**Impact on Goals:** [G1-G5 goals still achievable]

Questions? Let's discuss in Friday's sprint demo.

— John
```

---

## 📞 Contact Information

| Stakeholder | Role | Slack | Email | Availability |
|-------------|------|-------|-------|--------------|
| Sarah | Product Owner | @sarah | sarah@company.com | 9-5 Mon-Fri |
| John (ME) | Product Manager | @john | john@company.com | 9-6 Mon-Fri |
| Bob | Scrum Master | @bob | bob@company.com | 9-5 Mon-Fri |
| Quinn | QA | @quinn | quinn@company.com | 9-5 Mon-Fri |
| Winston | Architect | @winston | winston@company.com | Flexible |
| Dev Team | Developers | @dev-team | dev-team@company.com | 9-5 Mon-Fri |

---

## 📚 Related Documents

- **Roadmap:** `docs/product/ROADMAP.md` (sprint timeline)
- **Success Metrics:** `docs/product/SUCCESS_METRICS.md` (what to report)
- **PRD:** `docs/prd.md` (product requirements)
- **Stories:** `docs/stories/*.md` (user stories)

---

**Last Updated:** 2025-10-24 by John (Product Manager) 📊

**Next Review:** After Sprint 1 (Week 2)

---

_"The single biggest problem in communication is the illusion that it has taken place."_
— George Bernard Shaw
