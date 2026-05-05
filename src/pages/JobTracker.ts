import { Page, Locator, expect } from "@playwright/test";
import { DataGenerator } from "../utils/dataGenerator";

/** Default kanban columns on the Job Tracker board.
 *  Pass a custom list to getJobCardColumn / navigation assertions when the user has added extra columns.
 */
export const DEFAULT_COLUMNS = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
] as const;

export type ColumnStatus = (typeof DEFAULT_COLUMNS)[number] | string;

export interface JobDetails {
  jobTitle?: string;
  company?: string;
  jobPostURL?: string;
  salary?: number | string;
  status?: string;
  location?: string;
  description?: string;
  tags?: string;
}

export class JobTrackerPage {
  readonly page: Page;

  // Toolbar
  readonly addJobButton: Locator;
  readonly jobCards: Locator; // all job cards, regardless of column
  readonly addColumnButton: Locator;

  // Add Job dialog
  readonly addJobDialog: Locator;
  readonly jobTitleInput: Locator;
  readonly companyNameInput: Locator;
  readonly tagsCloseButton: Locator;
  readonly submitButton: Locator;

  // Job Details dialog (view + edit — same dialog, edit mode replaces content)
  readonly jobDetailsDialog: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly saveChangesButton: Locator;

  // Status dropdown — the .ant-select wrapper around the [aria-label="Job Status"] combobox
  readonly jobStatusDropdown: Locator;
  readonly jobStatusOptions: Locator;
  readonly jobStatusSelectedOption: Locator;
  readonly jobStatusChangeToastMsg: Locator;

  // Edit-mode fields (revealed after clicking Edit inside Job Details)
  readonly jobTitleEditInput: Locator;
  readonly companyNameEditInput: Locator;
  readonly jobUrlEditInput: Locator;
  readonly salaryEditInput: Locator;
  readonly locationEditInput: Locator;
  readonly descriptionEditInput: Locator;
  readonly tagsInput: Locator;

  // Delete confirmation dialog
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addJobButton = page.getByRole("button", { name: "Add Job" });
    this.jobCards = page.locator(".job-card");
    this.addColumnButton = page.getByRole("button", {
      name: "Add custom column",
    });
    this.addJobDialog = page.getByRole("dialog", { name: "Add Job" });
    this.jobTitleInput = page.getByRole("textbox", { name: "Job Title *" });
    this.companyNameInput = page.getByRole("textbox", {
      name: "Company Name *",
    });
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.tagsCloseButton = page.locator(".ant-row [data-icon='close']");
    this.jobDetailsDialog = page.getByRole("dialog", { name: "Job Details" });
    this.deleteButton = page.getByRole("button", { name: "Delete" });
    this.editButton = page
      .getByRole("button")
      .locator("span")
      .filter({ hasText: "Edit" });
    this.saveChangesButton = page.getByRole("button", { name: "Save Changes" });

    // The clickable wrapper that opens the dropdown (NOT the inner <input>)
    this.jobStatusDropdown = page.locator(".ant-select").filter({
      has: page.locator('[aria-label="Job Status"]'),
    });
    // Visible option labels in the floating overlay (NOT the virtual listbox role="option" items)
    this.jobStatusOptions = page.locator(".ant-select-item-option-content");
    // The span showing the currently selected status value
    this.jobStatusSelectedOption = page
      .locator(".ant-select")
      .filter({ has: page.locator('[aria-label="Job Status"]') })
      .locator(".ant-select-selection-item");
    this.jobStatusChangeToastMsg = page.locator(
      ".ant-message-top .ant-message-success",
    );
    // Edit-mode fields (no aria-labels; identified by id or placeholder)
    this.jobTitleEditInput = page.locator("#JobTitle");
    this.companyNameEditInput = page.locator("#companyName");
    this.jobUrlEditInput = page.getByPlaceholder("Enter job url");
    this.salaryEditInput = page.locator("#salary");
    this.locationEditInput = page.locator("#location");
    this.descriptionEditInput = page
      .locator("[contenteditable='true']")
      .first();
    this.tagsInput = page.getByPlaceholder("Tags");

    this.confirmDeleteButton = page.getByRole("button", { name: "OK" });
  }

  async goto() {
    await this.page.goto("/board");
    await this.page.waitForURL(/\/board/);
    await expect(this.page).toHaveTitle(/Job Tracker/);
    await expect(this.jobCards.first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Asserts that every column heading in `columns` is visible on the board.
   * Defaults to DEFAULT_COLUMNS; pass a custom list to include extra columns.
   */
  async verifyBoardColumns(
    columns: readonly string[] = DEFAULT_COLUMNS,
  ): Promise<void> {
    for (const col of columns) {
      await expect(
        this.page.getByRole("heading", { name: col, level: 2 }),
      ).toBeVisible();
    }
  }

  async addCustomColumn(columnName: string) {
    // Click the "Add Column" button, which opens a prompt dialog with a text input and "OK" button
    await this.addColumnButton.click();
    const promptInput = this.page.locator(".ant-modal input");
    await promptInput.fill(columnName);
    await this.page.getByRole("button", { name: "OK" }).click();
    // Wait for the new column to appear on the board
    await expect(
      this.page.getByRole("heading", { name: columnName, level: 2 }),
    ).toBeVisible();
  }

  /** Returns the card button for a job by title — board-wide search. */
  jobCard(jobTitle: string): Locator {
    return this.jobCards.filter({ hasText: jobTitle }).first();
  }

  /** Returns the numeric job count shown in a column heading's badge. */
  async statusColumnCount(statusName: string): Promise<number> {
    const locator = this.page.locator(
      `//h2[normalize-space()='${statusName}']/ancestor::div[contains(@class,'ant-row')]//sup`,
    );
    await locator.waitFor({ state: "visible" });
    const text = await locator.textContent();
    const match = text?.match(/\d+/);
    if (!match) {
      throw new Error(
        `No numeric value found in column "${statusName}". Got: "${text}"`,
      );
    }
    return Number(match[0]);
  }

  /** Returns the job-card grid inside a specific column. */
  columnGrid(statusName: string): Locator {
    // First grid in document order that follows the column's h2 heading
    return this.page.locator(
      `//h2[normalize-space()='${statusName}']/following::*[@role='grid'][1]`,
    );
  }

  /**
   * Returns the column name ("Saved", "Applied", etc.) that currently
   * contains the given job card. Throws if the card is not found in any column.
   */
  async getJobCardColumn(
    jobTitle: string,
    columns: readonly string[] = DEFAULT_COLUMNS,
  ): Promise<string> {
    await expect(this.jobCard(jobTitle)).toBeVisible({ timeout: 15000 });
    for (const column of columns) {
      const card = this.columnGrid(column)
        .locator(".job-card")
        .filter({ hasText: jobTitle });
      if (await card.isVisible()) {
        return column;
      }
    }
    throw new Error(`Job card "${jobTitle}" was not found in any column`);
  }

  // ─── Add Job ─────────────────────────────────────────────────────────────

  async openAddJobDialog() {
    await this.addJobButton.click();
    await this.addJobDialog.waitFor({ state: "visible" });
  }

  async addJob(jobTitle: string, companyName: string) {
    await this.openAddJobDialog();
    await this.jobTitleInput.fill(jobTitle);
    await this.companyNameInput.fill(companyName);
    await this.submitButton.click();
    await this.addJobDialog.waitFor({ state: "hidden" });
  }

  // ─── Job Details ─────────────────────────────────────────────────────────

  async openJobDetails(jobTitle: string) {
    await this.jobCard(jobTitle).click();
    await this.jobDetailsDialog.waitFor({ state: "visible" });
  }

  async closeJobDetails() {
    await this.jobDetailsDialog.getByRole("button", { name: "Close" }).click();
    await this.page.reload();
    // Wait for the board to fully re-render after the reload (React fetches jobs from API)
    await this.jobCards.first().waitFor({ state: "visible", timeout: 20000 });
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────

  async openEditForm(jobTitle: string) {
    await this.openJobDetails(jobTitle);
    await this.editButton.click();
    await this.saveChangesButton.waitFor({ state: "visible" });
  }

  async saveEdit() {
    await this.saveChangesButton.click();
    await this.saveChangesButton.waitFor({ state: "hidden" });
  }

  async editJobTitle(currentTitle: string, newTitle: string) {
    await this.openEditForm(currentTitle);
    await this.jobTitleEditInput.clear();
    await this.jobTitleEditInput.fill(newTitle);
    await this.saveEdit();
  }

  /** Update any combination of job fields. Only provided (non-undefined) fields are touched. */
  async editJob(currentTitle: string, details: JobDetails) {
    await this.openEditForm(currentTitle);

    if (details.jobTitle !== undefined) {
      await this.jobTitleEditInput.clear();
      await this.jobTitleEditInput.fill(details.jobTitle);
    }
    if (details.company !== undefined) {
      await this.companyNameEditInput.clear();
      await this.companyNameEditInput.fill(details.company);
    }
    if (details.jobPostURL !== undefined) {
      await this.jobUrlEditInput.clear();
      await this.jobUrlEditInput.fill(details.jobPostURL);
    }
    if (details.salary !== undefined) {
      await this.salaryEditInput.clear();
      await this.salaryEditInput.fill(String(details.salary));
    }
    if (details.location !== undefined) {
      await this.locationEditInput.clear();
      await this.locationEditInput.fill(details.location);
    }
    if (details.description !== undefined) {
      await this.descriptionEditInput.clear();
      await this.descriptionEditInput.fill(details.description);
    }
    if (details.tags !== undefined) {
      await this.addTag(details.tags);
    }

    await this.saveEdit();
  }

  async addTag(tags: string, removeExisting: boolean = true) {
    if (removeExisting) {
      while ((await this.tagsCloseButton.count()) > 0) {
        await this.tagsCloseButton.first().click();
      }
    }
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    for (const tag of tagList) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press("Enter");
    }
  }

  // ─── Status ──────────────────────────────────────────────────────────────

  async changeJobStatus(jobTitle: string, status?: string) {
    await this.openJobDetails(jobTitle);
    const currentStatus =
      (await this.jobStatusSelectedOption.textContent())?.trim() ?? "";
    let updatedStatus: string;

    await this.jobStatusDropdown.click();

    if (status !== undefined) {
      updatedStatus = status;
      await this.jobStatusOptions.getByText(status, { exact: true }).click();
    } else {
      const count = await this.jobStatusOptions.count();
      const i = DataGenerator.randomNumber(0, count - 1);
      updatedStatus = (
        (await this.jobStatusOptions.nth(i).textContent()) ?? ""
      ).trim();
      await this.jobStatusOptions.nth(i).click();
    }

    await expect(this.jobStatusChangeToastMsg).toBeVisible();
    await expect(this.jobStatusChangeToastMsg).toHaveText(
      `Job moved from ${currentStatus} to ${updatedStatus}`,
    );
    await this.closeJobDetails();
  }
  
  /**
   * Drags a job card to the target column.
   */
  async dragJobToColumn(jobTitle: string, targetColumn: string): Promise<void> {
    await this.page.evaluate(() => {
      document.body.style.userSelect = "none";
      (document.body.style as any).webkitUserSelect = "none";
    });

    try {
      const vw = await this.page.evaluate(() => window.innerWidth);

      // 1. Scroll the PAGE so the target column heading is at 40 % of viewport width.
      //    The board uses document-level horizontal scroll (window.scrollBy), NOT an
      //    overflow element — confirmed: id="main".scrollLeft has zero effect on positions.
      //    Placing the target at 40 % keeps both it and the source well inside the
      //    viewport and clear of rbd's 25 px auto-scroll trigger zone.
      await this.page.evaluate(
        ({ col, targetFraction }: { col: string; targetFraction: number }) => {
          const h = Array.from(document.querySelectorAll("h2")).find(
            (el) => el.textContent?.trim() === col,
          );
          if (!h) return;
          const colCenterX = h.getBoundingClientRect().x + h.getBoundingClientRect().width / 2;
          const desiredViewportX = window.innerWidth * targetFraction;
          window.scrollBy(colCenterX - desiredViewportX, 0);
        },
        { col: targetColumn, targetFraction: 0.4 },
      );
      await this.page.waitForTimeout(400);

      // 2. Ensure the source card is also in the viewport.
      const dragHandle = this.page
        .locator("[data-rbd-drag-handle-draggable-id]")
        .filter({ hasText: jobTitle })
        .first();
      await dragHandle.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);

      // 3. Read both positions (both now safely inside viewport).
      const srcPos = await dragHandle.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });

      const tgtPos = await this.page.evaluate((col: string) => {
        const h = Array.from(document.querySelectorAll("h2")).find(
          (el) => el.textContent?.trim() === col,
        );
        if (!h) return null;
        const r = h.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height + 80 };
      }, targetColumn);

      if (!tgtPos) throw new Error(`Column heading "${targetColumn}" not found after scroll`);

      // 4. Start the drag.
      await this.page.mouse.move(srcPos.x, srcPos.y);
      await this.page.mouse.down();
      await this.page.waitForTimeout(600); // rbd drag-start detection window
      await this.page.mouse.move(srcPos.x + 5, srcPos.y, { steps: 5 }); // cross threshold
      await this.page.waitForTimeout(200);

      // 5. If scrollIntoViewIfNeeded (step 2) scrolled the source into view and pushed
      //    the target off-screen (x < 50 or x > vw-50), fall back to the edge-hover
      //    approach: hold mouse at the relevant viewport edge so rbd auto-scrolls the
      //    page until the target column becomes visible, then re-read and drop.
      //    Otherwise (target already in safe zone) do a direct move.
      let finalTgt = tgtPos;
      if (tgtPos.x < 50 || tgtPos.x > vw - 50) {
        const edgeX = tgtPos.x < 50 ? 40 : vw - 40;
        await this.page.mouse.move(edgeX, srcPos.y, { steps: 20 });
        await this.page.waitForTimeout(2500); // let rbd auto-scroll the page
        const after = await this.page.evaluate((col: string) => {
          const h = Array.from(document.querySelectorAll("h2")).find(
            (el) => el.textContent?.trim() === col,
          );
          if (!h) return null;
          const r = h.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height + 80 };
        }, targetColumn);
        if (after) finalTgt = after;
      }

      await this.page.mouse.move(finalTgt.x, finalTgt.y, { steps: 50 });
      await this.page.waitForTimeout(600); // let droppable activate
      await this.page.mouse.up();
      await this.page.waitForTimeout(1000); // animation settle
    } finally {
      await this.page.evaluate(() => {
        document.body.style.userSelect = "";
        (document.body.style as any).webkitUserSelect = "";
      });
    }
  }

  // ─── Verify ──────────────────────────────────────────────────────────────

  /**
   * Asserts that the Job Details dialog (already open, view mode) shows the
   * expected values. Only fields present in `details` are checked.
   *
   * Field → DOM mapping (observed post-save):
   *   jobTitle    → h3.ant-typography
   *   company     → span.truncate
   *   location    → span.truncate
   *   salary      → span.truncate  (rendered as "Salary: <value>")
   *   description → div under h4 "Description"
   *   tags        → div._skillBox_e995r_416 per tag (comma-separated string)
   */
  async verifyJobDetails(details: JobDetails): Promise<void> {
    const d = this.jobDetailsDialog;

    if (details.jobTitle !== undefined) {
      await expect(
        d.getByRole("heading", { name: details.jobTitle, level: 3 }),
      ).toBeVisible();
    }
    if (details.company !== undefined) {
      await expect(
        d.locator("span.truncate").filter({ hasText: details.company }),
      ).toBeVisible();
    }
    if (details.location !== undefined) {
      await expect(
        d.locator("span.truncate").filter({ hasText: details.location }),
      ).toBeVisible();
    }
    if (details.salary !== undefined) {
      await expect(
        d
          .locator("span.truncate")
          .filter({ hasText: `Salary: ${details.salary}` }),
      ).toBeVisible();
    }
    if (details.status !== undefined) {
      const currentStatus =
        (await this.jobStatusSelectedOption.textContent())?.trim() ?? "";
      expect(currentStatus).toBe(details.status);
    }
    if (details.description !== undefined) {
      await expect(d.getByLabel("Job details and requirements")).toHaveText(
        details.description,
      );
    }
    if (details.tags !== undefined) {
      const tagList = details.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      for (const tag of tagList) {
        await expect(
          d.locator("._skillBox_e995r_416").filter({ hasText: tag }),
        ).toBeVisible();
      }
    }
  }

  async deleteJob(jobTitle: string) {
    await this.openJobDetails(jobTitle);
    await this.deleteButton.click();
    await this.confirmDeleteButton.click();
    await this.jobDetailsDialog.waitFor({ state: "hidden" });
  }
}

