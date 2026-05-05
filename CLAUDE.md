# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

End-to-end UI test suite for the CareerFlow web app (`https://app.careerflow.ai/`) built on Playwright + TypeScript. There is no application source here — only tests and the page objects that drive them.

## Commands

`package.json` defines no npm scripts; invoke Playwright directly via `npx`.

- Install browsers (first-time setup): `npx playwright install`
- Run all tests: `npx playwright test`
- Run a single spec: `npx playwright test src/tests/example.spec.ts`
- Run a single test by title: `npx playwright test -g "has title"`
- Headed / debug / UI modes: `npx playwright test --headed`, `--debug`, `--ui`
- Show last HTML report: `npx playwright show-report`
- Type-check only (no test runner): `npx tsc --noEmit`

## Configuration notes (do not "fix" without intent)

- [playwright.config.ts](playwright.config.ts) is the active config. `backup-config,ts` (note the comma in the filename) is a stashed copy of the Playwright scaffold — leave it alone unless asked.
- `headless: false` is set globally, so `npx playwright test` opens real browser windows. Pass `--headed=false` if you need a headless run.
- Only the **Chrome Testing** project is enabled; Firefox/WebKit/mobile projects are commented out in the config.
- `baseURL` is `https://app.careerflow.ai/`, so `page.goto('/some/path')` resolves against the live app. Tests hit production — be mindful of state-changing actions.
- Workers: 2 locally, 4 on CI (`process.env.CI`). `forbidOnly` is enforced on CI, so don't commit `test.only`.
- TypeScript is `strict` with `module: node16` — relative imports between `.ts` files compile fine for Playwright but require explicit `.js` extensions if you ever run them through plain `tsc`/`node`.

## Layout

- `src/tests/` — spec files (`*.spec.ts`) discovered by Playwright via `testDir`.
- `src/pages/` — Page Object Model classes (`LoginPage.ts`, `JobTracker.ts` exist as empty stubs). New page objects belong here; import them into specs rather than putting selectors inline.
