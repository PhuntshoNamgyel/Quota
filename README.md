# Quota — Student Attendance Monitoring & Absence Management System

A cross-platform mobile application that replaces the manual paper-based attendance process at CST. Lecturers mark attendance in seconds. Students see their live attendance status, absence allowance, and compliance standing per module at any time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native + Expo |
| Language | TypeScript (frontend + backend) |
| Navigation | React Navigation (native-stack) |
| State | Context API |
| Backend | Node.js + Express |
| Database | SQLite via better-sqlite3 |
| Auth | JWT + bcryptjs |
| Testing | Jest + ts-jest + supertest |

---

## Project Structure

```
Quota/
├── backend/
│   └── src/
│       ├── config/         # db.ts (schema), seed.ts (demo data)
│       ├── controllers/    # HTTP request handlers (MVC)
│       ├── middleware/     # JWT auth + RBAC
│       ├── models/         # TypeScript types
│       ├── observers/      # Observer pattern — notification logic
│       ├── repositories/   # All SQL — one class per table
│       ├── routes/         # Express route definitions
│       ├── services/       # Business logic
│       ├── strategies/     # Strategy pattern — attendance policy
│       └── utils/          # slotUtils.ts — break-aware class counting
├── frontend/
│   └── src/
│       ├── api/            # client.ts — fetch wrapper with JWT
│       ├── context/        # AuthContext
│       ├── navigation/     # RootNavigator, types
│       └── screens/
│           ├── lecturer/   # Module, Attendance, Reports screens
│           └── student/    # Dashboard, History, Notifications screens
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone (iOS or Android)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env        # fill in JWT_SECRET
npm run seed                # create and populate the database
npm run dev                 # start the API on http://localhost:4000
```

### Frontend Setup

```bash
cd frontend
npm install
npx expo start              # scan the QR code with Expo Go
```

> Make sure your phone and computer are on the same Wi-Fi network.

---

## Environment Variables

Create a `.env` file inside `backend/`:

```
PORT=4000
JWT_SECRET=your_secret_here
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Lecturer | lecturer.cst@rub.edu.bt | Lecturer123 |
| Student | 02240354.cst@rub.edu.bt | 02240354 |

All 27 students follow the same pattern — email is `<studentNo>.cst@rub.edu.bt` and password is the student number.

---

## Running Tests

```bash
cd backend
npm test          # runs all Jest tests
npm run seed      # reseed demo data after tests
```

Tests cover the quota calculation logic, attendance policy thresholds (green/yellow/red), and key API endpoints (login, auth guards, student dashboard).

---

## How Quota Calculation Works

```
percentage        = (attended / held) × 100   [100% if no sessions held yet]
maxAbsences       = floor(plannedTotal × 0.1)
remainingAbsences = max(0, maxAbsences − missed)
```

`plannedTotal` is calculated from the module's weekly schedule and semester weeks, with CST's tea break (10:00–10:15) and lunch break (12:15–13:15) deducted from each slot. This means students can see their full absence allowance from the very first day of the module.

---

## Compliance Colours

| Colour | Range | Meaning |
|---|---|---|
| Green | ≥ 90% | Compliant |
| Yellow | 80–89% | Medical exemption zone — at risk |
| Red | < 80% | Non-compliant |

---

## Design Patterns

| Pattern | Location | Purpose |
|---|---|---|
| MVC | controllers/, services/, screens/ | Separates HTTP handling, business logic, and UI |
| Repository | repositories/ | All SQL in one place per table — database is swappable |
| Strategy | strategies/StandardAttendancePolicy.ts | Attendance policy isolated — change thresholds without touching calculation |
| Observer | observers/ | Notifications fire automatically after attendance changes |
| RBAC | middleware/auth.ts | Role enforced on every protected route via JWT |

---

## Seeded Modules

| Module | Schedule |
|---|---|
| SWE201 Cross Platform Development | Tue 10:15–12:15, Wed 11:15–13:15 |
| SDA202 System Design & Solution Architecture | Tue 13:15–15:15, Wed 09:00–11:00 |
| CTE205 Operating Systems | Mon 13:15–14:15, Thu 09:00–10:00, Fri 09:00–10:00 |
| DIS303 Cryptology | Mon 11:15–12:15, Tue 09:00–10:00, Thu 10:15–12:15 |
| DSO101 CI/CD | Mon 09:00–11:15, Thu 13:15–15:15 |

---

## Built With

React Native · Expo · TypeScript · Node.js · Express · SQLite · JWT · bcryptjs · Jest