import { Page, Locator } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class ProductPage {
    private product: Locator;
    private items: Locator;
    private cartBadge: Locator;
    private cartLink: Locator;
    private sortDropdown: Locator;

    constructor(private page: Page) {
        this.product = page.locator('.inventory_item_description');
        this.items = page.locator('.inventory_item');
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.cartLink = page.locator('.shopping_cart_link');
        this.sortDropdown = page.locator('.product_sort_container');
    }

    private itemByName(productName: string): Locator {
        return this.items.filter({ hasText: productName });
    }

    async productcount() {
        await this.product.first().waitFor({ state: 'visible' });
        return await this.product.count();
    }

    async verifyPrice(productName: string) {
        const findText = this.product.filter({ hasText: productName });
        const productPrice = findText.locator('.inventory_item_price');
        return await productPrice.innerText();
    }

    async addToCart(productName: string) {
        await this.itemByName(productName).getByRole('button', { name: 'Add to cart' }).click();
    }

    async removeFromCart(productName: string) {
        await this.itemByName(productName).getByRole('button', { name: 'Remove' }).click();
    }

    async cartCount(): Promise<number> {
        if ((await this.cartBadge.count()) === 0) {
            return 0;
        }
        return Number(await this.cartBadge.innerText());
    }

    async openCart() {
        await this.cartLink.click();
    }

    async sortBy(option: SortOption) {
        await this.sortDropdown.selectOption(option);
    }

    async productNames(): Promise<string[]> {
        return await this.page.locator('.inventory_item_name').allInnerTexts();
    }

    async productPrices(): Promise<number[]> {
        const texts = await this.page.locator('.inventory_item_price').allInnerTexts();
        return texts.map((t) => Number(t.replace('$', '')));
    }

    async selectDropdown(optionName: string) {
        const menu = this.page.getByRole('button', { name: 'Open Menu' });
        await menu.click();
        const dropdown = this.page.getByRole('button', { name: 'Dynamic Catalog' });
        await dropdown.click();
        const submenu = this.page.locator('#dynamic_catalog_submenu');
        const option = submenu.getByRole('button', { name: optionName });
        if (await option.isVisible()) {
            await option.click();
            return optionName;
        }
        return null;
    }

    async scrollToProduct(productName: string) {
        const product = this.product.filter({ hasText: productName });
        await product.scrollIntoViewIfNeeded();
        return await product.isVisible();
    }

    async logout() {
        await this.page.getByRole('button', { name: 'Open Menu' }).click();
        const logout = this.page
            .getByRole('link', { name: 'Logout' })
            .or(this.page.getByRole('button', { name: 'Logout' }));
        await logout.click();
    }
}
