import { test, expect } from '../fixtures/Fixture';
import { products, TOTAL_PRODUCTS } from '../test-data/products';

test('Inventory shows all products', { tag: ['@smoke', '@ui'] }, async ({ productPage }) => {
  expect(await productPage.productcount()).toBe(TOTAL_PRODUCTS);
});

test('Backpack price is shown correctly', { tag: '@ui' }, async ({ productPage }) => {
  const price = await productPage.verifyPrice(products.backpack.name);
  expect(price).toBe('$' + products.backpack.price);
});

test('Sort by name A to Z', { tag: '@ui' }, async ({ productPage }) => {
  await productPage.sortBy('az');
  const names = await productPage.productNames();
  expect(names).toEqual([...names].sort());
});

test('Sort by name Z to A', { tag: '@ui' }, async ({ productPage }) => {
  await productPage.sortBy('za');
  const names = await productPage.productNames();
  expect(names).toEqual([...names].sort().reverse());
});

test('Sort by price low to high', { tag: '@ui' }, async ({ productPage }) => {
  await productPage.sortBy('lohi');
  const prices = await productPage.productPrices();
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

test('Sort by price high to low', { tag: '@ui' }, async ({ productPage }) => {
  await productPage.sortBy('hilo');
  const prices = await productPage.productPrices();
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
});

test('Open menu and pick a catalog option', { tag: '@ui' }, async ({ productPage }) => {
  const picked = await productPage.selectDropdown('Spinner');
  expect(picked).toBe('Spinner');
});

test('Scroll to Fleece Jacket', { tag: '@ui' }, async ({ productPage }) => {
  const visible = await productPage.scrollToProduct(products.fleeceJacket.name);
  expect(visible).toBeTruthy();
});

test('Logout returns to the login page', { tag: '@ui' }, async ({ page, productPage }) => {
  await productPage.logout();
  await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});
