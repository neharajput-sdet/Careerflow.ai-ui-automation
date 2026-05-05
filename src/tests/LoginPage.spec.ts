import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ENV } from "../utils/env";
import { DataGenerator } from "../utils/dataGenerator";
import loginTestData from "../test-data/Login.json";

// The project-level storageState holds a saved authenticated session (populated by auth.setup.ts).
// Login tests must bypass that — if the session were loaded, the app would redirect straight to the
// dashboard and the login form would never appear. Clearing cookies/origins here forces a fresh,
// unauthenticated browser context for every test in this file without affecting other spec files.
test.use({ storageState: { cookies: [], origins: [] } });

test("Logging in with valid credentials redirect to dashboard", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle(/Login/);

  await loginPage.login(ENV.USER_EMAIL, ENV.USER_PASSWORD);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page).toHaveTitle("Welcome to Dashboard");
});

test("Logging in with invalid password displays error message", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle(/Login/);

  await loginPage.login(ENV.USER_EMAIL, DataGenerator.randomString(7));
  await expect(loginPage.incorrectCredentialsErrorMsg).toHaveText(
    loginTestData["invalidCredentials"].invalidPasswordErrorMsg,
  );
});

test("Logging in with invalid email displays error message", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle(/Login/);
  const invalidEmail = `${DataGenerator.randomString(5)}@example.com`;
  await loginPage.login(invalidEmail, DataGenerator.randomString(7));
  await expect(loginPage.incorrectCredentialsErrorMsg).toHaveText(
    loginTestData["invalidCredentials"].invalidEmailErrorMsg,
  );
});

