import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly showPasswordButton: Locator;
  readonly forgotPasswordButton: Locator;
  readonly incorrectCredentialsErrorMsg: Locator;
  readonly continueWithGoogleLink: Locator;
  readonly signUpTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: "example@email.com" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.showPasswordButton = page.getByRole("button", {
      name: "Show Password",
    });
    this.forgotPasswordButton = page.getByRole("button", {
      name: "Forgot password?",
    });
    this.continueWithGoogleLink = page.getByRole("link", {
      name: "Continue with Google",
    });
    this.signUpTab = page.getByRole("tab", { name: "Sign Up" });
    this.incorrectCredentialsErrorMsg = page
      .locator(".ant-message-error")
      .first();
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Navigate to login, authenticate, and wait until the dashboard is reached. */
  async loginAs(email: string, password: string) {
    await this.goto();
    await this.login(email, password);
    await this.page.waitForURL(/\/dashboard/);
  }
}

