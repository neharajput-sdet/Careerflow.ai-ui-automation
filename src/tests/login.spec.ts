import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ENV } from "../utils/env";
import { DataGenerator } from "../utils/dataGenerator";
import loginTestData from "../test-data/Login.json";

// Login tests must start unauthenticated — override the project-level storageState
// so the saved session is not loaded and the login form is actually shown.
test.use({ storageState: { cookies: [], origins: [] } });

test("valid credentials redirect to dashboard", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle(/Login/);

  await loginPage.login(ENV.USER_EMAIL, ENV.USER_PASSWORD);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page).toHaveTitle("Welcome to Dashboard");
});

test("Invalid password displays error message", async ({
  page,
}) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle(/Login/);

  await loginPage.login(ENV.USER_EMAIL, DataGenerator.randomString(7));
  await expect(loginPage.incorrectCredentialsErrorMsg).toHaveText(
    loginTestData["invalidCredentials"].invalidPasswordErrorMsg
  );
});

