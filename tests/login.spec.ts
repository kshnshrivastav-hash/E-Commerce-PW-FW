import { test, expect } from '../fixtures/Fixture'
import { users } from '../test-data/cred';

test.beforeEach(async ({ page }) => { 
  await page.goto('/'); 
});

test('Valid Login', async ({page, loginPage}) => {
  await loginPage.login(users.standard.username, users.standard.password);
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator('.inventory_container')).toBeVisible();
});


test('Locked out user', async ({loginPage}) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
  await loginPage.verifyLockedOutError(); 
});

test('Invalid password', async ({loginPage}) => {
  await loginPage.login(users.invalidPassword.username, users.invalidPassword.password);
  await loginPage.invalidPasswordMsg();
});

test('Invalid User', async ({loginPage}) => {
  await loginPage.login(users.invalidUsername.username, users.invalidUsername.password);
  await loginPage.invalidUserMsg();
});