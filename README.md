# CareerFlow AI — UI Test Automation

End-to-end UI test suite for [CareerFlow](https://app.careerflow.ai/) built with **Playwright** and **TypeScript**. Tests run against the live production app.

---

## Tools & Versions

| Tool | Version |
|---|---|
| Node.js | ≥ 18 (LTS recommended) |
| @playwright/test | ^1.59.1 |
| TypeScript | bundled with Playwright |
| dotenv | ^17.4.2 |
| Browser | Chromium (Desktop Chrome profile) |

---

## Prerequisites

- **Node.js ≥ 18** — [download](https://nodejs.org/)
- A CareerFlow account with valid credentials

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd CareerFlow-AI
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

Only Chromium is required for the active test project, but the command above installs all browsers. To install only Chromium:

```bash
npx playwright install chromium
```

### 3. Configure environment variables

Create a `.env` file at the project root (never commit this file):

```env
test_user_email=your-email@example.com
test_user_password=your-password
```

The test suite reads these via `dotenv` at startup. Missing variables cause an explicit error before any test runs.

### 4. Verify setup (optional type-check)

```bash
npx tsc --noEmit
```

---

## Running Tests

| Command | What it does |
|---|---|
| `npm test` | Run all tests (headless off by default) |
| `npm run test:headed` | Run with visible browser windows |
| `npm run test:ui` | Open Playwright's interactive UI mode |
| `npm run test:debug` | Run with Playwright Inspector for step-through debugging |
| `npm run report` | Open the last HTML report |
| `npx playwright test src/tests/LoginPage.spec.ts` | Run only login tests |
| `npx playwright test src/tests/JobTrackerPage.spec.ts` | Run only job tracker tests |
| `npx playwright test -g "valid credentials"` | Run a single test by title |
| `npx playwright test --headed=false` | Force headless mode |

> Tests hit the live **production** app. Avoid running tests that mutate data in shared accounts during active user sessions.

---

## Project Structure

```
CareerFlow-AI/
├── src/
│   ├── tests/              # Spec files (discovered automatically)
│   │   ├── auth.setup.ts       # Global auth setup — saves session to disk
│   │   ├── LoginPage.spec.ts   # Login flow tests
│   │   └── JobTrackerPage.spec.ts  # Job Tracker board tests
│   ├── pages/              # Page Object Model classes
│   │   ├── LoginPage.ts
│   │   └── JobTracker.ts
│   ├── fixtures/           # Custom Playwright fixtures
│   │   └── test-fixtures.ts
│   ├── utils/              # Helpers (env, constants, data generators)
│   └── test-data/          # Static JSON test data
├── playwright.config.ts    # Active Playwright configuration
├── .env                    # Local credentials (not committed)
└── package.json
```

---

## Configuration Notes

- **Auth flow**: `auth.setup.ts` logs in once and saves the browser storage state to disk. All tests in the `Chrome Browser Testing` project reuse this saved session, so login does not repeat for every test.
- **Login tests**: Override the saved session with an empty state so the login form is actually rendered, not bypassed.
- **Parallel execution**: 2 workers locally, 4 on CI. `fullyParallel: true` means individual tests within a file can run concurrently unless marked `serial`.
- **Retries**: 1 retry locally, 2 on CI.
- **Artifacts on failure**: traces, screenshots, and video are retained automatically.
- **CI guard**: `forbidOnly` prevents accidentally committed `test.only` from blocking the pipeline.

---

## CI/CD

Set the following secrets in your CI environment (GitHub Actions, etc.):

```
test_user_email
test_user_password
```

The config detects `process.env.CI` automatically and adjusts workers and retries accordingly.
