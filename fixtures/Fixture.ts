import { test as Base } from '@playwright/test';
import { LoginPage } from '../pages/Loginpage';
import { ProductPage } from '../pages/Productpage';
import { CartPage } from '../pages/cartPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { users } from '../test-data/cred';

type Fixture = {
    loginPage: LoginPage;
    productPage: ProductPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
};

export const test = Base.extend<Fixture>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    // Logs in as the standard user before the test starts
    productPage: async ({ page, loginPage }, use) => {
        await page.goto('/');
        await loginPage.login(users.standard.username, users.standard.password);
        const productPage = new ProductPage(page);
        await use(productPage);
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },

    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
});

export { expect } from '@playwright/test';
