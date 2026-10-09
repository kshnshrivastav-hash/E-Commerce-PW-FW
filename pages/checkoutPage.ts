import { Page, Locator, expect } from '@playwright/test';

export interface CheckoutInfo {
    firstName: string;
    lastName: string;
    postalCode: string;
}

const parseAmount = (text: string): number => {
    const match = text.match(/\$([\d.]+)/);
    if (!match) {
        throw new Error(`No amount found in: ${text}`);
    }
    return Number(match[1]);
};

export class CheckoutPage {
    private firstName: Locator;
    private lastName: Locator;
    private postalCode: Locator;
    private continueBtn: Locator;
    private cancelBtn: Locator;
    private finishBtn: Locator;
    private errorMsg: Locator;

    constructor(private page: Page) {
        this.firstName = page.getByPlaceholder('First Name');
        this.lastName = page.getByPlaceholder('Last Name');
        this.postalCode = page.getByPlaceholder('Zip/Postal Code');
        this.continueBtn = page.getByRole('button', { name: 'Continue' });
        this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
        this.finishBtn = page.getByRole('button', { name: 'Finish' });
        this.errorMsg = page.locator('.error-message-container.error');
    }

    async fillInformation(info: Partial<CheckoutInfo>) {
        if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
        if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
        if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
    }

    async continue() {
        await this.continueBtn.click();
    }

    async cancel() {
        await this.cancelBtn.click();
    }

    async finish() {
        await this.finishBtn.click();
    }

    async expectError(message: string) {
        await expect(this.errorMsg).toHaveText(message);
    }

    async expectOnOverview() {
        await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    }

    async itemTotal(): Promise<number> {
        return parseAmount(await this.page.locator('.summary_subtotal_label').innerText());
    }

    async tax(): Promise<number> {
        return parseAmount(await this.page.locator('.summary_tax_label').innerText());
    }

    async total(): Promise<number> {
        return parseAmount(await this.page.locator('.summary_total_label').innerText());
    }

    async expectOrderComplete() {
        await expect(this.page).toHaveURL(/checkout-complete\.html/);
        await expect(this.page.locator('.complete-header')).toHaveText('Thank you for your order!');
    }
}
