import { Locator, Page, expect } from '@playwright/test';

export class LoginPage {
    private username: Locator;
    private password: Locator;
    private loginBtn: Locator;
    private errorMsg: Locator;

    constructor(page: Page) {
        this.username = page.getByPlaceholder('Username');
        this.password = page.getByPlaceholder('Password');
        this.loginBtn = page.getByRole('button', { name: 'Login' });
        this.errorMsg = page.locator('.error-message-container.error');
    }

    async login(username: string, password: string) {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginBtn.click();
    }

    async verifyError(message: string) {
        await expect(this.errorMsg).toHaveText(message);
    }

    async verifyLockedOutError() {
        await this.verifyError('Epic sadface: Sorry, this user has been locked out.');
    }

    async invalidPasswordMsg() {
        await this.verifyError('Epic sadface: Username and password do not match any user in this service');
    }

    async invalidUserMsg() {
        await this.verifyError('Epic sadface: Username and password do not match any user in this service');
    }
}
