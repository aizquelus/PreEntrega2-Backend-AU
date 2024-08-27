import { Router } from 'express';
import { ProductsManager } from '../dao/ProductsManager.js';
import __dirname from '../utils.js';

export const router = (io) => {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            let products = await ProductsManager.getProducts();
            res.render('home', { products });
        } catch (error) {
            res.render('errorPage')
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


    return router;
}

