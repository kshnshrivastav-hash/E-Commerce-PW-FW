# Test Strategy

## Purpose

This document explains what is tested in this project, how, and why. The application under test has two parts:

- **UI:** the public demo store at https://www.saucedemo.com
- **API:** a local shop API (`mock/shop-server.js`) that mirrors the store's products, users, cart and checkout. It is started automatically by Playwright, so API tests run anywhere without a network or a real backend.

## Scope

| In scope | Out of scope |
|---|---|
| Login, product list, sorting, cart, checkout (UI) | Real payment processing |
| Authentication, products, cart and orders (API) | Load and security testing |
| Negative and boundary scenarios | Mobile apps |
| Regression and smoke suites | Visual pixel comparison |

## Test types

| Type | Where | Tag |
|---|---|---|
| UI end-to-end | `tests/*.spec.ts` | `@ui` |
| API functional | `tests/api/*.spec.ts` | `@api` |
| Negative and boundary | UI and API | `@negative` |
| Smoke (fast health check of critical flows) | UI and API | `@smoke` |
| Regression | Everything, run before a release | all tests |
| Manual and exploratory | `docs/manual-testing/` | not automated |

## Run commands

| Command | What it runs |
|---|---|
| `npm run test:smoke` | Critical flows only (8 tests) |
| `npm run test:api` | All API tests |
| `npm run test:negative` | Negative scenarios on UI (Chromium) and API |
| `npm run test:ui` | UI tests on Chromium |
| `npm test` | Full regression: all browsers and the API |

## What gets automated, and what stays manual

**Automate:** repeatable checks of stable behavior, such as login rules, cart totals, checkout validation and API contracts.

**Keep manual:** things where human judgement matters or automation is not worth the cost, such as layout and readability, exploratory testing of new features, usability, and checking the wording of messages in context. See `docs/manual-testing/test-cases.csv`, where each case is marked Automated or Manual.

## Negative testing approach

For each input or rule, test what should be rejected: wrong or missing values, wrong types, values outside limits, missing authentication, wrong role or owner, and operations on things that do not exist. Each negative test also checks that **a rejected request does not change data** (for example, the cart stays the same).

## Environments

| Environment | Used for |
|---|---|
| Local | Development and debugging (`npm run test:headed`) |
| GitHub Actions | Smoke and API on every push, full regression nightly |

## Entry and exit criteria

- **Entry:** the build runs, the demo store is reachable, and the mock API starts.
- **Exit for a release:** all smoke tests pass, no failing regression tests without a logged defect, and no open critical or high defects.

## Defects

Defects are reported using `docs/manual-testing/bug-report-template.md` with steps, expected and actual results, severity and evidence.

## Risks

| Risk | Mitigation |
|---|---|
| The demo site changes its layout or behavior | Keep locators in page objects, and update them in one place |
| Shared data between tests | Each API test logs in and gets its own session and cart |
| Slow or flaky browser runs | Retries in CI, traces and videos on failure, and a small smoke suite |
