import fs from 'fs'
import { ProductsManager } from './ProductsManager.js';

export class CartsManager {
    static path;

    static async getCarts() {
        if (!this.path) throw new Error('Carts path is not set.');

        if (fs.existsSync(this.path)) {
            let carts = JSON.parse(await fs.promises.readFile(this.path, { encoding: 'utf8' }));

            return carts;
        } else {
            return [];
        }
    }

    static async addCart() {
        let carts = await this.getCarts();

        let id = 1;
        if (carts.length > 0) {
            id = Math.max(...carts.map(c => c.id)) + 1;
        }

        let newCart = {
            id,
            products: []
        }

        carts.push(newCart);

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 5));

        return newCart;
    }

    static async addProductToCart (cId, pId) {
        let carts = await this.getCarts();

        const cart = carts.find(c => c.id === cId);
        if (!cart) {
            throw new Error(`Error: Cart with ID ${cId} does not exist.`);
        }

        if (!await ProductsManager.checkProductExists(pId)) {
            throw new Error(`Error: Product with id ${pId} not found.`);
        }

        let addedProduct;
        const productIndex = cart.products.findIndex(p => p.product === pId);
        if (productIndex === -1) {
            addedProduct = { product: pId, quantity: 1 };
            cart.products.push(addedProduct);
        } else {
            cart.products[productIndex].quantity += 1;
            addedProduct = cart.products[productIndex];
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 5));

        return cart.products;
    }
}
