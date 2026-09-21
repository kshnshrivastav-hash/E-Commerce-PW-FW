import { test, expect } from '../fixtures/Fixture';
import { ProductPage } from '../pages/Productpage';

test('Verify Product Count', async ({productPage}) => {
    const count = await productPage.productcount();
    console.log('Product Count:', count);

});

test('Capture Price and verify', async ({productPage}) => {
const bagpackPrice = await productPage.verifyPrice('Sauce Labs Backpack');
console.log('Price:', bagpackPrice);
});

test('open menu and dropdown', async ({productPage}) => {
const clickoption = await productPage.selectDropdown('Spinner');
});


test('Scroll to Fleece Jacket', async ({ productPage }) => {

    const visible = await productPage.scrollToProduct('Sauce Labs Fleece Jacket');
    
    expect(visible).toBeTruthy();
});
