import { test, expect } from '../fixtures/Fixture';
import { products, checkoutInfo } from '../test-data/products';

test('Complete checkout with one item', { tag: ['@smoke', '@ui'] }, async ({ productPage, cartPage, checkoutPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.openCart();
  await cartPage.checkout();

  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.continue();
  await checkoutPage.expectOnOverview();
  await checkoutPage.finish();
  await checkoutPage.expectOrderComplete();
});

test('Complete checkout with two items', { tag: '@ui' }, async ({ productPage, cartPage, checkoutPage }) => {
  await productPage.addToCart(products.bikeLight.name);
  await productPage.addToCart(products.onesie.name);
  await productPage.openCart();
  await cartPage.checkout();

  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.continue();
  await checkoutPage.finish();
  await checkoutPage.expectOrderComplete();
});

test('Order summary totals add up', { tag: '@ui' }, async ({ productPage, cartPage, checkoutPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.addToCart(products.bikeLight.name);
  await productPage.openCart();
  await cartPage.checkout();
  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.continue();

  const expectedItemTotal = Number((products.backpack.price + products.bikeLight.price).toFixed(2));
  const itemTotal = await checkoutPage.itemTotal();
  const tax = await checkoutPage.tax();
  const total = await checkoutPage.total();

  expect(itemTotal).toBe(expectedItemTotal);
  expect(total).toBe(Number((itemTotal + tax).toFixed(2)));
});

const missingFieldCases = [
  { name: 'first name', info: { lastName: 'Rao', postalCode: '400001' }, error: 'Error: First Name is required' },
  { name: 'last name', info: { firstName: 'Asha', postalCode: '400001' }, error: 'Error: Last Name is required' },
  { name: 'postal code', info: { firstName: 'Asha', lastName: 'Rao' }, error: 'Error: Postal Code is required' },
];

for (const c of missingFieldCases) {
  test(`Checkout is blocked when ${c.name} is missing`, { tag: ['@negative', '@ui'] }, async ({ productPage, cartPage, checkoutPage }) => {
    await productPage.addToCart(products.backpack.name);
    await productPage.openCart();
    await cartPage.checkout();

    await checkoutPage.fillInformation(c.info);
    await checkoutPage.continue();
    await checkoutPage.expectError(c.error);
  });
}

test('Cancel on the information page returns to the cart', { tag: '@ui' }, async ({ page, productPage, cartPage, checkoutPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.openCart();
  await cartPage.checkout();
  await checkoutPage.cancel();
  await expect(page).toHaveURL(/cart\.html/);
});

test('Cart is empty after an order is completed', { tag: '@ui' }, async ({ productPage, cartPage, checkoutPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.openCart();
  await cartPage.checkout();
  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.continue();
  await checkoutPage.finish();
  await checkoutPage.expectOrderComplete();

  expect(await productPage.cartCount()).toBe(0);
});
