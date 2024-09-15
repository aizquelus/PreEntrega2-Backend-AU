import { Router } from 'express';
import { ProductsManager } from '../dao/ProductsManagerMongo.js';
import __dirname from '../utils.js';

export const router = (io) => {
    const router = Router();

    router.get('/', async (req, res) => {
        let { page, limit, query, sort } = req.query;

        if(!page || isNaN(Number(page))) page = 1;

        if(!limit || isNaN(Number(limit))) limit = 5;

        const validSort = ['asc', 'desc'];
        sort = validSort.includes(sort) ? sort : '';


        try {
            let products = await ProductsManager.getProducts(page, limit, sort);
            res.render('home', { products });
        } catch (error) {
            res.render('errorPage')
        }
    });

    router.get('/products/:pid', async (req, res) => {
        const { pid } = req.params;

        try {
            let product = await ProductsManager.getProductBy({ _id: pid });
            if (!product) {
                return res.render('errorPage', { error: `Product with ID ${pid} not found.` });
            }
            
            res.render('productDetails', { product });
        } catch (error) {
            res.render('errorPage', { error: 'Something went wrong - Try again later.' });
        }
    });

    router.get('/realtimeproducts', async (req, res) => {
        io.on('connection', socket => {
            console.log(`Cliente conectado - ID ${socket.id} `)
        });
        let pathToJS = `/js/index.js`;
        try {
            let products = await ProductsManager.getProducts();
            res.render('realTimeProducts', { products, pathToJS });
        } catch (error) {
            res.render('errorPage');
        }
    });

    router.get('/carts/:cid', async (req, res) => {
        const { cid } = req.params;

        try {
            let cart = await CartsManager.getCartById(cid);
            if (!cart) {
                return res.render('errorPage', { error: `Cart with ID ${cid} not found.` });
            }

            res.render('cartDetails', { cart });
        } catch (error) {
            res.render('errorPage', { error: 'Something went wrong - Try again later.' });
        }
    });

    return router;
}

