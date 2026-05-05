# CareerFlow AI — Test Cases

> **Application:** https://app.careerflow.ai/
> **Framework:** Playwright + TypeScript
> **Test data:** `src/test-data/JobTracker.json` · `.env`

---

## Table of Contents

- [TS-01 Login](#ts-01-login)
- [TS-02 Job Tracker — Page Navigation](#ts-02-job-tracker--page-navigation)
- [TS-03 Job Tracker — Job Card Actions](#ts-03-job-tracker--job-card-actions)
- [TS-04 Job Tracker — Status Change via Dropdown](#ts-04-job-tracker--status-change-via-dropdown)
- [TS-05 Job Tracker — Drag & Drop](#ts-05-job-tracker--drag--drop)
- [Summary](#summary)

---

## TS-01 Login

**Spec:** [`src/tests/login.spec.ts`](src/tests/login.spec.ts)
**Page Object:** [`src/pages/LoginPage.ts`](src/pages/LoginPage.ts)

---

### [TC-001 — Valid credentials redirect to dashboard](src/tests/login.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-001 |
| **Priority** | Critical |
| **Type** | Functional / E2E |
| **Preconditions** | Valid `test_user_email` and `test_user_password` in `.env` |

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | URL contains `/login`; page title matches `/Login/` |
| 2 | Enter valid email and password | Fields are populated |
| 3 | Click **Login** | Form is submitted |
| 4 | Wait for navigation | URL changes to `/dashboard`; title is `"Welcome to Dashboard"` |

---

### [TC-002 — Valid email with invalid password shows error](src/tests/login.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-002 |
| **Priority** | High |
| **Type** | Negative / Functional |
| **Preconditions** | Valid `test_user_email` in `.env`; invalid password generated via `DataGenerator.randomString(7)` |

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | URL contains `/login`; page title matches `/Login/` |
| 2 | Enter valid email and a random 7-character password | Fields are populated |
| 3 | Click **Login** | Login attempt is submitted |
| 4 | Observe response | Error message is displayed; user remains on `/login` |

---

## TS-02 Job Tracker — Page Navigation

**Spec:** [`src/tests/jobTracker.spec.ts`](src/tests/jobTracker.spec.ts)
**Page Object:** [`src/pages/JobTracker.ts`](src/pages/JobTracker.ts)

---

### [TC-003 — Verify Job Tracker page elements](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-003 |
| **Priority** | High |
| **Type** | Smoke / Functional |
| **Preconditions** | `jobTrackerPage` fixture navigates to `/board` and waits for cards |

| # | Action | Expected Result |
|---|---|---|
| 1 | Check URL and title | URL matches `/board`; title matches `/Job Tracker/` |
| 2 | Check **Add Job** button | Visible |
| 3 | Check **Add custom column** button | Visible |
| 4 | Call `verifyBoardColumns()` | All 5 default column headings visible: Saved, Applied, Interviewing, Offer, Rejected |

---

## TS-03 Job Tracker — Job Card Actions

**Spec:** [`src/tests/jobTracker.spec.ts`](src/tests/jobTracker.spec.ts)
**Page Object:** [`src/pages/JobTracker.ts`](src/pages/JobTracker.ts)

**Shared setup:**
- Existing card identified by `editJobDetails.jobTitle` = `"Test Company Edit"` in `JobTracker.json`
- `afterEach` restores the card's title to `"Test Company Edit"` after every test

---

### [TC-004 — Edit job card details and verify changes are saved](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-004 |
| **Priority** | High |
| **Type** | Functional / CRUD |
| **Test Data** | `newJobCardDetails` — all fields generated at runtime via `DataGenerator` (timestamp-unique title, company, salary, location, description, tags) |

| # | Action | Expected Result |
|---|---|---|
| 1 | Call `editJob("Test Company Edit", newJobCardDetails)` | Edit form opens; all provided fields filled; "Save Changes" clicked |
| 2 | Close job details dialog | Dialog closes; board reloads |
| 3 | Open job details for `newJobCardDetails.jobTitle` | Job Details dialog opens for the updated card |
| 4 | Call `verifyJobDetails(newJobCardDetails)` | Title (`h3`), company (`span.truncate`), location, salary (`"Salary: <n>"`), description, and each tag chip match the generated data |
| 5 | *afterEach* — `editJob(newJobCardDetails.jobTitle, { jobTitle: "Test Company Edit" })` | Card title restored to original |

---

## TS-04 Job Tracker — Status Change via Dropdown

**Spec:** [`src/tests/jobTracker.spec.ts`](src/tests/jobTracker.spec.ts)
**Page Object:** [`src/pages/JobTracker.ts`](src/pages/JobTracker.ts)

**Shared setup for TC-041 through TC-045:**
- Tests run **serially** (`test.describe.serial`) — each test leaves the card in the new column
- Card: `statusChangeJob.jobTitle` = `"Job Status Change"` in `JobTracker.json`
- If the card is already in the target column, the test **self-skips** (`test.skip`)
- Dropdown click targets the Ant Design `.ant-select-item-option-content` overlay, not the virtual listbox

---

### [TC-041 — Change status to "Saved"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-041 |
| **Priority** | High |
| **Type** | Functional |

| # | Action | Expected Result |
|---|---|---|
| 1 | `getJobCardColumn(jobTitle)` | Returns current column |
| 2 | Record baseline counts for current and `"Saved"` columns | Captured |
| 3 | `changeJobStatus(jobTitle, "Saved")` | Opens Job Details dialog → clicks status dropdown → selects "Saved" → toast visible → dialog closes |
| 4 | `getJobCardColumn(jobTitle)` | Returns `"Saved"` |
| 5 | Assert counts | Source column − 1; `"Saved"` column + 1 |

---

### [TC-042 — Change status to "Applied"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-042 |
| **Priority** | High |
| **Type** | Functional |

*Same pattern as TC-041, target = `"Applied"`*

| # | Action | Expected Result |
|---|---|---|
| 1–5 | Same steps as TC-041 with target `"Applied"` | Card moves to Applied; counts updated |

---

### [TC-043 — Change status to "Interviewing"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-043 |
| **Priority** | High |
| **Type** | Functional |

*Same pattern as TC-041, target = `"Interviewing"`*

---

### [TC-044 — Change status to "Offer"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-044 |
| **Priority** | High |
| **Type** | Functional |

*Same pattern as TC-041, target = `"Offer"`*

---

### [TC-045 — Change status to "Rejected"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-045 |
| **Priority** | High |
| **Type** | Functional |

*Same pattern as TC-041, target = `"Rejected"`*

---

## TS-05 Job Tracker — Drag & Drop

**Spec:** [`src/tests/jobTracker.spec.ts`](src/tests/jobTracker.spec.ts)
**Page Object:** [`src/pages/JobTracker.ts`](src/pages/JobTracker.ts)

**Shared setup for TC-051 through TC-055:**
- Tests run **serially** inside the same `test.describe.serial` as TS-04
- Card: `dragAndDropJob.jobTitle` = `"drag and drop job"` in `JobTracker.json`
- If the card is already in the target column, the test **self-skips**
- Drag mechanism: `[data-rbd-drag-handle-draggable-id]` → `mousedown` → 5 px nudge → rbd auto-scroll → `mouseup` over target column

---

### [TC-051 — Drag card to "Saved"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-051 |
| **Priority** | High |
| **Type** | Functional / Drag & Drop |

| # | Action | Expected Result |
|---|---|---|
| 1 | `getJobCardColumn(jobTitle)` | Returns current column |
| 2 | Record baseline counts | Captured |
| 3 | `dragJobToColumn(jobTitle, "Saved")` | rbd drag handle scrolled into view; `mousedown` + nudge; rbd auto-scrolls if needed; `mouseup` over Saved column |
| 4 | `getJobCardColumn(jobTitle)` | Returns `"Saved"` |
| 5 | Assert counts | Source − 1; `"Saved"` + 1 |
| 6 | `openJobDetails(jobTitle)` then `verifyJobDetails({ status: "Saved" })` | Job Details dialog shows status `"Saved"` |
| 7 | `closeJobDetails()` | Dialog closes; board reloads |

---

### [TC-052 — Drag card to "Applied"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-052 |
| **Priority** | High |
| **Type** | Functional / Drag & Drop |

*Same pattern as TC-051, target = `"Applied"`*

---

### [TC-053 — Drag card to "Interviewing"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-053 |
| **Priority** | High |
| **Type** | Functional / Drag & Drop |

*Same pattern as TC-051, target = `"Interviewing"`*

---

### [TC-054 — Drag card to "Offer"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-054 |
| **Priority** | High |
| **Type** | Functional / Drag & Drop |

*Same pattern as TC-051, target = `"Offer"`*

---

### [TC-055 — Drag card to "Rejected"](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-055 |
| **Priority** | High |
| **Type** | Functional / Drag & Drop |

*Same pattern as TC-051, target = `"Rejected"`*

---

## Summary

| TC ID | Title | Spec | Priority | Status |
|---|---|---|---|---|
| TC-001 | Valid credentials redirect to dashboard | login.spec.ts | Critical | Active |
| TC-002 | Valid email + invalid password shows error | login.spec.ts | High | Active |
| TC-003 | Verify Job Tracker page elements | jobTracker.spec.ts | High | Active |
| TC-004 | Edit job card details and verify changes | jobTracker.spec.ts | High | Active |
| TC-041 | Change status to "Saved" via dropdown | jobTracker.spec.ts | High | Active (serial) |
| TC-042 | Change status to "Applied" via dropdown | jobTracker.spec.ts | High | Active (serial) |
| TC-043 | Change status to "Interviewing" via dropdown | jobTracker.spec.ts | High | Active (serial) |
| TC-044 | Change status to "Offer" via dropdown | jobTracker.spec.ts | High | Active (serial) |
| TC-045 | Change status to "Rejected" via dropdown | jobTracker.spec.ts | High | Active (serial) |
| TC-051 | Drag card to "Saved" | jobTracker.spec.ts | High | Active (serial) |
| TC-052 | Drag card to "Applied" | jobTracker.spec.ts | High | Active (serial) |
| TC-053 | Drag card to "Interviewing" | jobTracker.spec.ts | High | Active (serial) |
| TC-054 | Drag card to "Offer" | jobTracker.spec.ts | High | Active (serial) |
| TC-055 | Drag card to "Rejected" | jobTracker.spec.ts | High | Active (serial) |
