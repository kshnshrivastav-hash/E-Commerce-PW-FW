import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
    private items: Locator;
    private checkoutBtn: Locator;
    private continueShoppingBtn: Locator;

    constructor(private page: Page) {
        this.items = page.locator('.cart_item');
        this.checkoutBtn = page.getByRole('button', { name: 'Checkout' });
        this.continueShoppingBtn = page.getByRole('button', { name: 'Continue Shopping' });
    }

    async expectLoaded() {
        await expect(this.page).toHaveURL(/cart\.html/);
    }

    // Web-first assertions: they retry until the cart has finished rendering
    async expectItemCount(count: number) {
        await expect(this.items).toHaveCount(count);
    }

    async expectItemNames(names: string[]) {
        await expect(this.page.locator('.cart_item .inventory_item_name')).toHaveText(names);
    }

    async itemPrice(productName: string): Promise<string> {
        return await this.items
            .filter({ hasText: productName })
            .locator('.inventory_item_price')
            .innerText();
    }

    async removeItem(productName: string) {
        await this.items.filter({ hasText: productName }).getByRole('button', { name: 'Remove' }).click();
    }

    async continueShopping() {
        await this.continueShoppingBtn.click();
    }

    async checkout() {
        await this.checkoutBtn.click();
    }
}
