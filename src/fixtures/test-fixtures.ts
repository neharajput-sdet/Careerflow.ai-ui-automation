import { test as base, type Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { JobTrackerPage } from "../pages/JobTracker";
import { ENV } from "../utils/env";

type Fixtures = {
  loggedInPage: Page;
  jobTrackerPage: JobTrackerPage;
};

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    // The chromium project pre-loads a saved storage state (auth/user.json),
    // so the session is already authenticated — no need to fill in credentials.
    // Navigate to /dashboard to confirm the session; fall back to full login
    // if the session has expired or the state file is missing.
    await page.goto("/dashboard");
    if (new URL(page.url()).pathname.includes("login")) {
      await new LoginPage(page).loginAs(ENV.USER_EMAIL, ENV.USER_PASSWORD);
    }
    await page.waitForURL(/\/dashboard/);
    await use(page);
  },
  jobTrackerPage: async ({ loggedInPage }, use) => {
    const tracker = new JobTrackerPage(loggedInPage);
    await tracker.goto();
    await use(tracker);
  },
});

export { expect } from "@playwright/test";
