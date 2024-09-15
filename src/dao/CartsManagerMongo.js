import { cartsModel } from './models/cartsModel.js';
import { ProductsManager } from './ProductsManagerMongo.js';

export class CartsManager {

    static async getCarts() {
        return await cartsModel.find({}).lean();
    }

    static async getCartById(id) {
        return await cartsModel.findById(id).lean();
    }

    static async addCart() {
        const newCart = await cartsModel.create({ products: [] });
        return newCart.toJSON();
    }

    static async addProductToCart (cId, pId) {
        let cart = await cartsModel.findOne({_id: cId}).populate( {path: "products.product"});

        if (!cart) {
            throw new Error(`Error: Cart with ID ${cId} does not exist.`);
        }

        const product = await ProductsManager.getProductBy({_id: pId});

        if (!product) {
            throw new Error(`Error: Product with id ${pId} not found.`);
        }

        let addedProduct;
        const productIndex = cart.products.findIndex(p => p.product._id.toString() === pId.toString());
        if (productIndex === -1) {
            addedProduct = { product: pId, quantity: 1 };
            cart.products.push(addedProduct);
        } else {
            cart.products[productIndex].quantity += 1;
            addedProduct = cart.products[productIndex];
        }

        await cart.save();

        return cart.products;
    }

    static async removeProductFromCart(cId, pId) {
        const result = await cartsModel.updateOne(
            { _id: cId },
            { $pull: { products: { product: pId } } }
        );
    
        if (result.nModified === 0) {
            throw new Error(`Error: Cart with ID ${cId} or Product with ID ${pId} does not exist.`);
        }
    
        return result;
    }

    static async clearCart(cId) {
        const result = await cartsModel.findByIdAndUpdate(
            cId,
            { $set: { products: [] } },
            { new: true }
        );
    
        if (!result) {
            throw new Error(`Error: Cart with ID ${cId} does not exist.`);
        }
    
        return result;
    }

    static async updateProductQuantity(cId, pId, quantity) {
        const result = await cartsModel.findOneAndUpdate(
            { _id: cId, 'products.product': pId },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        );
    
        if (!result) {
            throw new Error(`Error: Cart with ID ${cId} or Product with ID ${pId} does not exist.`);
        }
    
        return result.products;
    }

    static async updateCart(cId, products) {
        const cart = await cartsModel.findByIdAndUpdate(
            cId,
            { $set: { products: products } },
            { new: true }
        );
    
        if (!cart) {
            throw new Error(`Error: Cart with ID ${cId} does not exist.`);
        }
    
        return cart;
    }
}
