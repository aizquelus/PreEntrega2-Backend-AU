import { Router } from 'express';
import { CartsManager } from '../dao/CartsManagerMongo.js';
import { isValidObjectId } from 'mongoose';

export const router = Router();

CartsManager.path = './src/data/carts.json';

router.get('/', async (req, res) => {
        try {
            let carts = await CartsManager.getCarts();
            res.setHeader('Content-Type','application/json');
        return res.status(200).json({...carts});
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }
});

router.get('/:cid', async (req, res) => {
    let { cid } = req.params;

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `The ID must be a number.` });
    }

    try {
        let cart = await CartsManager.getCartById(cid);
        if (!cart) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `A cart with the ID ${cid} does not exist...` });
        } else {
            let cartProducts = cart.products;
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(cartProducts);
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.post('/', async (req, res) => {
    try {
        let newCart = await CartsManager.addCart();
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(newCart);
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    let { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `The ${isNaN(cid) ? 'Cart ID' : 'Product ID'} must be a valid format.` });
    }

    let cart = await CartsManager.getCartById(cid);
    if (!cart) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Cart with ID: ${cid} does not exist.` });
    }

    try {
        let cartProducts = await CartsManager.addProductToCart(cid, pid);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(cartProducts);
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.put('/:cid', async (req, res) => {
    let { cid } = req.params;
    let products = req.body;

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `The Cart ID must be a valid format.` });
    }

    try {
        let updatedCart = await CartsManager.updateCart(cid, products);
        if (!updatedCart) {
            return res.status(404).json({ error: `Cart with ID: ${cid} does not exist.` });
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(updatedCart);
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    let { cid, pid } = req.params;
    let { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `The ${isNaN(cid) ? 'Cart ID' : 'Product ID'} must be a valid format.` });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: `Quantity must be a valid number.` });
    }

    try {
        let updatedCart = await CartsManager.updateProductQuantity(cid, pid, quantity);
        if (!updatedCart) {
            return res.status(404).json({ error: `Cart with ID: ${cid} or Product with ID: ${pid} does not exist.` });
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(updatedCart);
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.delete('/:pid', async (req, res) => {
    let { cid } = req.params;

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `The Cart ID must be a valid format.` });
    }

    try {
        let result = await CartsManager.clearCart(cid);
        if (!result) {
            return res.status(404).json({ error: `Cart with ID: ${cid} does not exist.` });
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ message: `All products removed from cart with ID: ${cid}.` });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    let { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `The ${isNaN(cid) ? 'Cart ID' : 'Product ID'} must be a valid format.` });
    }

    try {
        let updatedCart = await CartsManager.removeProductFromCart(cid, pid);
        if (!updatedCart) {
            return res.status(404).json({ error: `Cart with ID: ${cid} or Product with ID: ${pid} does not exist.` });
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(updatedCart);
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});