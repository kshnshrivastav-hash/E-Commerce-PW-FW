export interface Product {
    name: string;
    price: number;
}

export const products: Record<string, Product> = {
    backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
    bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
    boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
    fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
    onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
};

export const TOTAL_PRODUCTS = 6;

export const checkoutInfo = {
    firstName: 'Asha',
    lastName: 'Rao',
    postalCode: '400001',
};
