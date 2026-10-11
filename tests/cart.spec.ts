import { test, expect } from '../fixtures/Fixture';
import { products } from '../test-data/products';

test('Adding one item updates the cart count', { tag: ['@smoke', '@ui'] }, async ({ productPage }) => {
  await productPage.addToCart(products.backpack.name);
  expect(await productPage.cartCount()).toBe(1);
});

test('Adding two items shows both in the cart', { tag: '@ui' }, async ({ productPage, cartPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.addToCart(products.bikeLight.name);
  expect(await productPage.cartCount()).toBe(2);

  await productPage.openCart();
  await cartPage.expectLoaded();
  await cartPage.expectItemCount(2);
  await cartPage.expectItemNames([products.backpack.name, products.bikeLight.name]);
});

test('Cart price matches the product page price', { tag: '@ui' }, async ({ productPage, cartPage }) => {
  const listPrice = await productPage.verifyPrice(products.fleeceJacket.name);
  await productPage.addToCart(products.fleeceJacket.name);
  await productPage.openCart();
  expect(await cartPage.itemPrice(products.fleeceJacket.name)).toBe(listPrice);
});

test('Removing an item on the product page clears the cart count', { tag: '@ui' }, async ({ productPage }) => {
  await productPage.addToCart(products.onesie.name);
  expect(await productPage.cartCount()).toBe(1);
  await productPage.removeFromCart(products.onesie.name);
  expect(await productPage.cartCount()).toBe(0);
});

test('Removing an item inside the cart updates the list', { tag: '@ui' }, async ({ productPage, cartPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.addToCart(products.boltTShirt.name);
  await productPage.openCart();

  await cartPage.removeItem(products.backpack.name);
  await cartPage.expectItemCount(1);
  await cartPage.expectItemNames([products.boltTShirt.name]);
});

test('Continue shopping returns to the inventory', { tag: '@ui' }, async ({ page, productPage, cartPage }) => {
  await productPage.addToCart(products.backpack.name);
  await productPage.openCart();
  await cartPage.continueShopping();
  await expect(page).toHaveURL(/inventory\.html/);
});
