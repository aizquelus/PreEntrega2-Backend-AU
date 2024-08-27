import { Router } from 'express';
import { ProductsManager } from '../dao/ProductsManager.js';

export const router = (io) => {
    const router = Router();

    ProductsManager.path = './src/data/products.json';

    router.get('/', async (req, res) => {
        let products;
        try {
            products = await ProductsManager.getProducts();
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }

        let { limit } = req.query;

        if (limit) {
            limit = Number(limit);

            if (isNaN(limit)) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `The limit argument must be a number.` });
            }
        } else {
            limit = products.length;
        }

        let resultado = products.slice(0, limit);

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(resultado);
    });

    router.get('/:pid', async (req, res) => {
        let { pid } = req.params;
        pid = Number(pid)

        if (isNaN(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `The ID must be a number.` });
        }

        let products;
        try {
            products = await ProductsManager.getProducts();
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }

        let product = products.find(p => p.id === pid);

        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `Product with ID ${pid} not found...` });
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ product });
    });

    router.post('/', async (req, res) => {
        let { title, description, code, price, status = true, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !status || !stock || !category) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Complete all required fields` });
        }

        let products;
        try {
            products = await ProductsManager.getProducts();
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }

        let titleExists = products.find(p => p.title.toLowerCase() === title.toLowerCase());
        if (titleExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `A product with the title ${title} already exists...` });
        }

        let codeExists = products.find(p => p.code.toLowerCase() === code.toLowerCase());
        if (codeExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `A product with the code ${code} already exists...` });
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
        pid = Number(pid)

        if (isNaN(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `The ID must be a number.` });
        }

        let products;
        try {
            products = await ProductsManager.getProducts();
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Something went wrong - Try again later.`,
                detail: `${error.message}`
            });
        }

        let product = products.find(p => p.id === pid);
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `Product with ID ${pid} not found...` });
        }

        let { ...toUpdate } = req.body;

        delete toUpdate.id;

        if (toUpdate.title || toUpdate.code) {
            let exists = products.find(p => (p.title.toLowerCase() === toUpdate.title.toLowerCase() || p.code.toLowerCase() === toUpdate.code.toLowerCase()) && p.id !== id);

            if (exists) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `A product with the title/code ${toUpdate.title ? toUpdate.title : toUpdate.code} already exists.` });
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
        pid = Number(pid)

        if (isNaN(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `The ID must be a number.` });
        }

        try {
            let result = await ProductsManager.deleteProduct(pid);
            if (result > 0) {
                io.emit('productDeleted', pid);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json(`Product has been deleted successfully.`);
            } else {
                res.setHeader('Content-Type', 'application/json');
                return res.status(500).json({
                    error: `Something went wrong - Try again later.`,
                    detail: `${error.message}`
                });
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
