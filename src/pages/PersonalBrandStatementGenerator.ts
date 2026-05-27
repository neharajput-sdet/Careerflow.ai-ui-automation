import { Page, Locator, expect } from "@playwright/test";

export class PersonalBrandStatementGenerator {
  readonly page: Page;
  readonly targetJobTitle: Locator;
  readonly keywordsField: Locator;


  constructor(page: Page) {
    this.page = page;
    this.targetJobTitle = page.getByPlaceholder('Enter Job Title');
    this.keywordsField = page.getByPlaceholder('Type to add keyword');
  }


}
