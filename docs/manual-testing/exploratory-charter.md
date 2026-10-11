# Exploratory Testing Charters

Exploratory testing is time-boxed, goal-driven testing where the tester learns and designs tests at the same time. Each charter below is a 45 to 60 minute session. Record what you tried, what you found and any questions.

## Charter template

| Field | Notes |
|---|---|
| **Mission** | Explore [area] with [technique or data] to discover [type of problem] |
| **Time box** | 45 to 60 minutes |
| **Environment** | Browser, user, build |
| **Notes** | What I tried and what happened |
| **Bugs found** | IDs |
| **Questions and risks** | Anything unclear |
| **Next charters** | Ideas for further sessions |

## Charters

1. **Cart behavior:** explore adding, removing and re-adding products, using the browser back button and page refresh, to discover count and state problems.
2. **Checkout form:** explore the information form with unusual input (very long text, spaces, symbols, emoji, pasted values) to discover validation gaps.
3. **Session handling:** explore logging out and navigating back, opening the app in two tabs, and opening a protected page directly, to discover access and session problems.
4. **Different users:** explore the same flows as each demo user type to discover behavior that differs and is not expected.
5. **Sorting and display:** explore each sort option together with adding items to the cart, to discover ordering or display problems.
6. **Interruptions:** explore refreshing, going back, or closing the tab in the middle of checkout, to discover lost data or inconsistent state.
7. **Responsive layout:** explore the app at narrow widths and zoom levels to discover layout and usability problems.
8. **Keyboard and basic accessibility:** explore using only the keyboard, to discover focus order, missing labels and controls that cannot be reached.

## Session log example (format only)

| Time | Action | Observation | Follow-up |
|---|---|---|---|
| 0:05 | Added 3 items, refreshed the page | Cart count stayed the same | None |
| 0:15 | (your next step) | (what you saw) | (bug or question) |
