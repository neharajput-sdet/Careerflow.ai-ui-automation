// Flow rationale:
// Tests are split into three groups ordered by dependency risk.
// 1. Page element verification runs standalone — it only reads the DOM and cannot break shared state.
// 2. Edit job details runs in a describe block with an afterEach teardown that restores the original
//    title after every test. This keeps the job card name predictable for the next group without
//    relying on test ordering.
// 3. Status and drag-and-drop tests are marked `serial` because they iterate over every column in
//    sequence: each test moves the card from wherever it currently sits, so the previous test's
//    end state is the next test's starting point. Running them in parallel would cause race
//    conditions where two tests fight over the same card position.
import { test, expect } from "../fixtures/test-fixtures";
import { JobDetails, DEFAULT_COLUMNS } from "../pages/JobTracker";
import { DataGenerator } from "../utils/dataGenerator";
import testData from "../test-data/JobTracker.json";

const newJobCardDetails: JobDetails = {
  jobTitle: "Job - " + DataGenerator.currentTimestamp(),
  company: "Company - " + DataGenerator.currentTimestamp(),
  jobPostURL: "https://example.com/job-posting",
  salary: DataGenerator.randomNumber(50000, 150000),
  location: DataGenerator.randomSentence(1),
  description: DataGenerator.randomSentence(DataGenerator.randomNumber(10, 20)),
  tags: DataGenerator.randomTags(3),
};

test("Verify Page Elements of Job Tracker Page", async ({
  jobTrackerPage,
  loggedInPage,
}) => {
  await expect(loggedInPage).toHaveURL(/\/board/);
  await expect(loggedInPage).toHaveTitle(/Job Tracker/);
  await expect(jobTrackerPage.addJobButton).toBeVisible();
  await expect(jobTrackerPage.addColumnButton).toBeVisible();
  await jobTrackerPage.verifyBoardColumns();
});

test.describe("Verify Job card actions", () => {
  test.afterEach(async ({ jobTrackerPage }) => {
    await jobTrackerPage.closeJobDetails();
    await jobTrackerPage.editJob(
      newJobCardDetails.jobTitle ? newJobCardDetails.jobTitle : "",
      {
        jobTitle: testData["editJobDetails"].jobTitle,
      },
    );
  });

  test("Edit Job Card Details and verify Edited Details are displayed correctly", async ({
    jobTrackerPage,
  }) => {
    await jobTrackerPage.editJob(
      testData["editJobDetails"].jobTitle,
      newJobCardDetails,
    );
    await jobTrackerPage.closeJobDetails();
    await jobTrackerPage.openJobDetails(
      newJobCardDetails.jobTitle ? newJobCardDetails.jobTitle : "",
    );
    await jobTrackerPage.verifyJobDetails(newJobCardDetails);
  });
});

test.describe.serial("Verify Changing Job Card Statuses", () => {
  const ALL_STATUSES = [...DEFAULT_COLUMNS];

  for (const targetStatus of ALL_STATUSES) {
    test(`Changing Job status to "${targetStatus}" & Verify Card is visible under the correct column`, async ({
      jobTrackerPage,
    }) => {
      const jobTitle = testData["statusChangeJob"].jobTitle;
      const originalColumn = await jobTrackerPage.getJobCardColumn(jobTitle);

      test.skip(
        originalColumn === targetStatus,
        `Card is already in "${targetStatus}" — nothing to move`,
      );

      const countInOriginalBefore =
        await jobTrackerPage.statusColumnCount(originalColumn);
      const countInTargetBefore =
        await jobTrackerPage.statusColumnCount(targetStatus);

      await jobTrackerPage.changeJobStatus(jobTitle, targetStatus);
      const currentColumn = await jobTrackerPage.getJobCardColumn(jobTitle);

      expect(currentColumn).toBe(targetStatus);
      expect(await jobTrackerPage.statusColumnCount(originalColumn)).toBe(
        countInOriginalBefore - 1,
      );
      expect(await jobTrackerPage.statusColumnCount(targetStatus)).toBe(
        countInTargetBefore + 1,
      );
    });
  }
  
  for (const targetStatus of ALL_STATUSES) {
    test(`Dragging job card to "${targetStatus}" column & verify card moves correctly`, async ({
      jobTrackerPage,
    }) => {
      const jobTitle = testData["dragAndDropJob"].jobTitle;
      const originalColumn = await jobTrackerPage.getJobCardColumn(jobTitle);

      test.skip(
        originalColumn === targetStatus,
        `Card is already in "${targetStatus}" — nothing to move`,
      );

      const countInOriginalBefore =
        await jobTrackerPage.statusColumnCount(originalColumn);
      const countInTargetBefore =
        await jobTrackerPage.statusColumnCount(targetStatus);

      await jobTrackerPage.dragJobToColumn(jobTitle, targetStatus);

      // Column membership
      const currentColumn = await jobTrackerPage.getJobCardColumn(jobTitle);
      expect(currentColumn).toBe(targetStatus);

      // Badge counts
      expect(await jobTrackerPage.statusColumnCount(originalColumn)).toBe(
        countInOriginalBefore - 1,
      );
      expect(await jobTrackerPage.statusColumnCount(targetStatus)).toBe(
        countInTargetBefore + 1,
      );

      // Job Details dialog confirms the status label
      await jobTrackerPage.openJobDetails(jobTitle);
      await jobTrackerPage.verifyJobDetails({ status: targetStatus });
      await jobTrackerPage.closeJobDetails();
    });
  }
});

