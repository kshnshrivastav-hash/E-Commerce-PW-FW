# E-Commerce Test Automation Framework

A test automation framework for an e-commerce application, built with **Playwright** and **TypeScript**. It covers **UI, API, negative and regression testing**, and includes the manual test documentation that goes with them.

- **UI tests** run against the public demo store [saucedemo.com](https://www.saucedemo.com).
- **API tests** run against a small local shop API (`mock/shop-server.js`) that mirrors the store's products, users, cart and checkout. The demo store has no public API, so I built this one to practise API testing. It starts automatically when the tests run.

## Coverage

| Layer | Tests | What is covered |
|---|---|---|
| UI (Chromium, Firefox, WebKit) | 29 | Login, products and sorting, cart, checkout, validation |
| API | 48 | Authentication, products, cart, orders, request chaining, data checks |
| Manual and exploratory | 32 documented cases, 8 charters | Cases that need human judgement, plus bug report template |

**Negative scenarios (43 tests)** include wrong, missing and blocked logins, invalid and expired-style tokens, bad quantities and types, unknown products, empty cart checkout, missing form fields, another user's order, malformed JSON, and checks that **a rejected request does not change data**.

**Tags** let you run the right set of tests:

| Tag | Meaning | Command |
|---|---|---|
| `@smoke` | Critical flows, fast check | `npm run test:smoke` |
| `@negative` | Negative and boundary scenarios | `npm run test:negative` |
| `@api` / `@ui` | By layer | `npm run test:api`, `npm run test:ui` |
| (all) | Full regression | `npm test` |

## Design

- **Page Object Model** and **custom fixtures** for the UI tests
- **Request chaining:** login, add to cart, checkout, then verify the order and the empty cart
- **Test isolation:** each API test logs in and gets its own session and cart, so tests can run in parallel
- **Test data kept separate** from test code
- **Web-first assertions** with no fixed waits
- **Reports:** HTML report, screenshots and videos on failure, traces on retry
- **CI with GitHub Actions:** API and smoke tests on every push, full regression nightly

## Project structure

```text
.
├── .github/workflows/playwright.yml   CI: smoke and API on push, full regression nightly
├── docs/
│   ├── test-strategy.md               Scope, test types, tags, risks, exit criteria
│   └── manual-testing/                32 test cases (CSV), exploratory charters, bug report template
├── fixtures/Fixture.ts                Custom fixtures
├── mock/shop-server.js                Local shop API used by the API tests
├── pages/                             Page objects (login, products, cart, checkout)
├── test-data/                         Users, products, checkout details
├── tests/
│   ├── api/                           API tests (auth, products, cart, orders)
│   └── *.spec.ts                      UI tests
└── playwright.config.ts               Projects: api, chromium, firefox, webkit
```

## Getting started

Requirements: Node.js (LTS).

```bash
git clone https://github.com/kshnshrivastav-hash/E-Commerce-PW-FW.git
cd E-Commerce-PW-FW
npm install
npx playwright install
```

## Running the tests

| Command | What it does |
|---|---|
| `npm test` | Full regression on all browsers and the API |
| `npm run test:smoke` | Critical flows only |
| `npm run test:api` | API tests only (no browser needed) |
| `npm run test:negative` | Negative scenarios on the API and Chromium |
| `npm run test:ui` | UI tests on Chromium |
| `npm run test:headed` | UI tests with a visible browser |
| `npm run report` | Open the last HTML report |

Run a single file or test:

```bash
npx playwright test tests/api/orders.api.spec.ts --project=api
npx playwright test -g "order totals add up" --project=api
```

## Manual testing and documentation

- [`docs/test-strategy.md`](docs/test-strategy.md): what is tested, how, and why
- [`docs/manual-testing/test-cases.csv`](docs/manual-testing/test-cases.csv): 32 cases, each marked Automated or Manual
- [`docs/manual-testing/exploratory-charter.md`](docs/manual-testing/exploratory-charter.md): charters for exploratory sessions
- [`docs/manual-testing/bug-report-template.md`](docs/manual-testing/bug-report-template.md): defect report format and severity guide

## Notes

- The UI target is a public demo, so its layout can change. If a locator stops working, update it in the relevant page object.
- The shop API is a local mock, not a real backend. It exists to practise API, negative and regression testing.

## Roadmap

- Reuse saved login state to speed up the UI suite
- Add a database layer with SQL checks
- Add visual and accessibility checks

## Author

Kishan Srivastav, QA Engineer (Playwright, TypeScript, API and SQL testing)
