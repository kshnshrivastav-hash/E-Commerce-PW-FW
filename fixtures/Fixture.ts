import { test as Base } from "@playwright/test";
import { LoginPage } from "../pages/Loginpage";
import { ProductPage } from "../pages/Productpage";
import { users } from "../test-data/cred";

type Fixture = {
    loginPage: LoginPage;
    productPage: ProductPage;

};

export const test = Base.extend<Fixture> ({
loginPage: async ({page}, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
},



productPage: async ({page, loginPage}, use) => {
    await page.goto("/");
    await loginPage.login(users.standard.username, users.standard.password);
    const productPage = new ProductPage(page);
    await use(productPage);
},
});   


export { expect } from '@playwright/test';