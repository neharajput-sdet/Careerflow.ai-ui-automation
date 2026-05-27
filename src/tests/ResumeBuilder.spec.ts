import { test, expect } from "../fixtures/test-fixtures";

test("Resume Builder - inspect DOM", async ({ loggedInPage, page }) => {
  await expect(loggedInPage).toHaveURL(/\/dashboard/);
  await loggedInPage.locator(".ant-menu-title-content").filter({hasText: "Resume Builder"}).click();
  // await loggedInPage.goto("/resume-builder");
  await page.waitForURL(/resume-builder/, { timeout: 20000 });

  await page.waitForSelector(".grid-view-item-header", {timeout: 5000});
  
  await page.locator(".grid-view-item-header").first().hover();

  await page.getByRole("button", {name: "Edit Resume"}).click();

});
