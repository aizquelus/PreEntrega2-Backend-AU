import { Router } from 'express';
import { CartsManager } from '../dao/CartsManager.js';

export const router = Router();

CartsManager.path = './src/data/carts.json';

router.get('/:cid', async (req, res) => {
    let { cid } = req.params;
    cid = Number(cid);

    if (isNaN(cid)) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(400).json({ error: `The ID must be a number.` });
    }

    let carts;
    try {
        carts = await CartsManager.getCarts();
        let cart = carts.find(c => c.id === cid);
        if (!cart) {
            res.setHeader('Content-Type', 'text/plain');
            return res.status(404).json({ error: `A cart with the ID ${cid} does not exist...` });
        } else {
            let cartProducts = cart.products;
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).json(cartProducts);
        }
    } catch (error) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.post('/', async (req, res) => {
    try {
        let newCart = await CartsManager.addCart();
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).json(newCart);
    } catch (error) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    let { cid, pid } = req.params;
    cid = Number(cid);
    pid = Number(pid)

    if (isNaN(cid) || isNaN(pid)) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(400).json({ error: `The ${isNaN(cid) ? 'Cart ID' : 'Product ID'} must be a number.` });
    }

    try {
        let addedProduct = await CartsManager.addProductToCart(cid, pid);
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).json(addedProduct);
    } catch (error) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).json({
            error: `Something went wrong - Try again later.`,
            detail: `${error.message}`
        });
    }
});
