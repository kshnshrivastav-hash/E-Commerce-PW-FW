import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {

    private product : Locator;


    constructor(private page: Page) {
        this.product = page.locator('.inventory_item_description');

    }

    async productcount() {
     await this.product.first().waitFor({ state: "visible" });
       return await this.product.count();
}

 
    async verifyPrice(productName: string) {
    const findText = this.product.filter({ hasText: productName });
    const productPrice = findText.locator('.inventory_item_price');
        return await productPrice.innerText();
    
    }

     async selectDropdown(optionName: string) {
        const menu = this.page.getByRole('button', {name: 'Open Menu'});
        await menu.click();
        const dropdown = this.page.getByRole('button', {name: 'Dynamic Catalog'});
        await dropdown.click();
        const submenu = this.page.locator('#dynamic_catalog_submenu');
        const optionCount = await submenu.getByRole('button').count();
        console.log('Total options:', optionCount);
        const option = submenu.getByRole('button', {name: optionName});
        if(await option.isVisible()) {
          console.log('Option visible:', optionName);
          await option.click();
          return optionName;
        }
        return null;
        }


    async scrollToProduct(productName: string) {
    const product = this.product.filter({ hasText: productName });
    await this.page.waitForTimeout(1000);
    await product.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    return await product.isVisible();
}
}
