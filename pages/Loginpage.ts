import { Locator, Page, expect} from '@playwright/test';

export class LoginPage {
    private username: Locator;
    private password: Locator;
    private loginBtn: Locator;
    private errorMsg: Locator;
    private invalidUser: Locator;
    private invalidPass: Locator;

    constructor(page:Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginBtn = page.getByRole('button', {name: 'Login'});
    this.errorMsg = page.locator('.error-message-container.error');
    this.invalidPass = page.locator('.error-message-container.error');
    this.invalidUser = page.locator('.error-message-container.error');
    }

    async login(username:string, password:string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginBtn.click();

    }

    async verifyLockedOutError() { 
        await expect(this.errorMsg).toHaveText( 'Epic sadface: Sorry, this user has been locked out.' ); 
    } 

    async invalidPasswordMsg() {
        await expect(this.invalidPass).toHaveText('Epic sadface: Username and password do not match any user in this service')
    }
    
async invalidUserMsg() {
        await expect(this.invalidUser).toHaveText('Epic sadface: Username and password do not match any user in this service')

}

}