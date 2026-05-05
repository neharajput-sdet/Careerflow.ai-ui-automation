import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ENV } from "../utils/env";
import { STORAGE_STATE } from "../utils/constants";

setup("do login", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginAs(ENV.USER_EMAIL, ENV.USER_PASSWORD);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page).toHaveTitle(/Welcome to Dashboard/);

  await page.context().storageState({ path: STORAGE_STATE });
});
