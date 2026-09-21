import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/Loginpage';
import { users } from '../test-data/cred';


test('authenticate user and save storage state', async ({ browser }) => {

   const context = await browser.newContext();

   const page = await context.newPage();

   await page.goto('/');

   const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, users.standard.password);

   await expect(page).toHaveURL(/inventory.html/);

   await context.storageState ({
    path : 'auth.json'
   });

   await context.close();
});





