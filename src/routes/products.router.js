import { Router } from 'express';
import { ProductsManager } from '../dao/ProductsManagerMongo.js';
import { isValidObjectId } from 'mongoose';

export const router = (io) => {
    const router = Router();

    router.get('/', async (req, res) => {
        let { page, limit, sort } = req.query;

        if(!page || isNaN(Number(page))) page = 1;

        if(!limit || isNaN(Number(limit))) limit = 5;

        const validSort = ['asc', 'desc'];
        sort = validSort.includes(sort) ? sort : '';
        
        let products;

        try {
            products = await ProductsManager.getProducts(page, limit, sort)
            res.setHeader('Content-Type','application/json');
        return res.status(200).json({...products});
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }
    });

    router.get('/:pid', async (req, res) => {
        let { pid } = req.params;

        if (!isValidObjectId(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `The ID does not have a valid format.` });
        }

        try {
            let product = await ProductsManager.getProductBy({_id:pid})
            if (!product) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(404).json({ error: `Product with ID ${pid} not found...` });
            }
    
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ product });
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }
    });

    router.post('/', async (req, res) => {
        let { title, description, code, price, status = true, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !status || !stock || !category) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Complete all required fields` });
        }

        let titleExists = await ProductsManager.getProductBy({title});
        let codeExists = await ProductsManager.getProductBy({code});
        if (titleExists || codeExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `A product with the ${titleExists ?  `title ${title}`: `code ${code}`} already exists...` });
        }

        let productToAdd = {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        }

        try {
            let newProduct = await ProductsManager.addProduct(productToAdd);
            io.emit('newProductAdded', newProduct);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(newProduct);
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }
    });

    router.put('/:pid', async (req, res) => {
        let { pid } = req.params;

        if (!isValidObjectId(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `The ID does not have a valid format.` });
        }

        let product = await ProductsManager.getProductBy({pid})
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `Product with ID ${pid} not found...` });
        }

        let { ...toUpdate } = req.body;

        delete toUpdate.id;

        if (toUpdate.title || toUpdate.code) {
            let titleExists = await ProductsManager.getProductBy({title});
            let codeExists = await ProductsManager.getProductBy({code});
            if (titleExists || codeExists) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `A product with the ${titleExists ?  `title ${title}`: `code ${code}`} already exists...` });
            }
        }

        try {
            let updatedProduct = await ProductsManager.updateProduct(pid, toUpdate);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(updatedProduct);
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }
    });

    router.delete('/:pid', async (req, res) => {
        let { pid } = req.params;

        if (!isValidObjectId(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `The ID does not have a valid format.` });
        }

        try {
            let result = await ProductsManager.deleteProduct(pid);
            if (result) {
                io.emit('productDeleted', pid);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json(`Product has been deleted successfully.`);
            } else {
                res.setHeader('Content-Type','application/json');
                return res.status(400).json({error:`Couldn't perform deletion. Product with ID ${pid} does not exist!`})
            }
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }
    });

    return router;
}
