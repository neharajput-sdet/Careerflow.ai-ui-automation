# CareerFlow AI — Test Cases Automated

## Following test cases have been automated in this project:

- [TS-01 Login](#ts-01-login)
- [TS-02 Job Tracker — Page Navigation](#ts-02-job-tracker--page-navigation)
- [TS-03 Job Tracker — Verify Editing an Existing Job Card](#ts-03-job-tracker--verify-editing-an-existing-job-card)
- [TS-04 Job Tracker — Status Change via Dropdown](#ts-04-job-tracker--status-change-via-dropdown)
- [TS-05 Job Tracker — Status Change via Drag & Drop](#ts-05-job-tracker--drag--drop)
- [Summary](#summary)

---

## TS-01 Login

**Spec:** [`src/tests/login.spec.ts`](src/tests/login.spec.ts)
**Page Object:** [`src/pages/LoginPage.ts`](src/pages/LoginPage.ts)

---

### [TC-001 — Logging in with valid credentials redirects to dashboard](src/tests/login.spec.ts)

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

### [TC-002 — Logging in with valid email and invalid password shows error](src/tests/login.spec.ts)

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

### [TC-003 — Logging in with invalid email displays error message](src/tests/login.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-003 |
| **Priority** | High |
| **Type** | Negative / Functional |
| **Preconditions** | No valid credentials required; random email + password generated via `DataGenerator.randomString` |

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | URL contains `/login`; page title matches `/Login/` |
| 2 | Enter a random 5-char string `@example.com` as email and a random 7-char password | Fields are populated |
| 3 | Click **Login** | Login attempt is submitted |
| 4 | Observe response | Error message is displayed; user remains on `/login` |

---

## TS-02 Job Tracker — Page Navigation

**Spec:** [`src/tests/jobTracker.spec.ts`](src/tests/jobTracker.spec.ts)
**Page Object:** [`src/pages/JobTracker.ts`](src/pages/JobTracker.ts)

---

### [TC-004 — Verify Job Tracker page elements](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-004 |
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

## TS-03 Job Tracker — Verify Editing an Existing Job Card

**Spec:** [`src/tests/jobTracker.spec.ts`](src/tests/jobTracker.spec.ts)
**Page Object:** [`src/pages/JobTracker.ts`](src/pages/JobTracker.ts)

**Pre-conditions:**
- User is logged in and on the Job Tracker board (`/board`)
- A job card titled **"Test Company Edit"** exists on the board in any column
- After the test, the card title is restored to **"Test Company Edit"** (cleanup step)

---

### [TC-005 — Edit all details of an existing job card and verify changes are saved and displayed correctly](src/tests/jobTracker.spec.ts)

| Field | Detail |
|---|---|
| **ID** | TC-005 |
| **Priority** | High |
| **Type** | Functional / CRUD |
| **Test Data** | All field values are unique and generated at runtime: timestamp-based Job Title and Company Name, a valid Job Post URL, a random Salary (between 50,000 and 150,000), random Location text, a random Description (10–20 words), and 3 randomly generated Tags |

| # | Step | Expected Result |
|---|---|---|
| 1 | On the board, locate the card titled **"Test Company Edit"** and click on it | The Job Details dialog opens showing the card's current information |
| 2 | Click the **Edit** button inside the dialog | The dialog switches to edit mode; the following fields become editable: Job Title, Company Name, Job Post URL, Salary, Location, Description, and Tags |
| 3 | Clear the **Job Title** field and enter a new unique job title | Job Title field reflects the new value |
| 4 | Clear the **Company Name** field and enter a new company name | Company Name field reflects the new value |
| 5 | Clear the **Job Post URL** field and enter a valid URL | Job Post URL field reflects the new value |
| 6 | Clear the **Salary** field and enter a numeric salary value (e.g. 85000) | Salary field reflects the new value |
| 7 | Clear the **Location** field and enter a location | Location field reflects the new value |
| 8 | Clear the **Description** field and enter a description | Description field reflects the new value |
| 9 | Remove all existing tags by clicking the **×** on each tag chip, then type 3 new tag names pressing **Enter** after each | All previous tags are removed; 3 new tag chips appear in the Tags field |
| 10 | Click **Save Changes** | The dialog returns to view mode |
| 11 | Close the Job Details dialog | The board reloads; the card is now visible under its new title |
| 12 | Click on the renamed card to open Job Details | The Job Details dialog opens for the updated card |
| 13 | Check the **Job Title** at the top of the dialog | Matches the title entered in step 3 |
| 14 | Check the **Company Name** | Matches the value entered in step 4 |
| 15 | Check the **Location** | Matches the value entered in step 7 |
| 16 | Check the **Salary** | Displayed as `"Salary: <value>"` and matches the value entered in step 6 |
| 17 | Check the **Description** | Matches the text entered in step 8 |
| 18 | Check the **Tags** section | All 3 tags are displayed as individual chips and match what was entered in step 9 |

**Post-condition / Cleanup:** The card's title is edited back to **"Test Company Edit"** to restore the board to a known state for subsequent runs.

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
| TC-003 | Invalid email displays error message | login.spec.ts | High | Active |
| TC-004 | Verify Job Tracker page elements | jobTracker.spec.ts | High | Active |
| TC-005 | Edit job card details and verify changes | jobTracker.spec.ts | High | Active |
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
