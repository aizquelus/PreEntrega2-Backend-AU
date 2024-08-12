import fs from 'fs'

export class ProductsManager {
    static path;

    static baseProductStructure = { 
        id: null,
        title: '',
        description: '',
        code: '',
        price: 0,
        status: true,
        stock: 0,
        category: '',
        thumbnails: []
    };

    static async getProducts () {
        if (!this.path) throw new Error('Products path is not set.');

        if(fs.existsSync(this.path)) {
            let products = JSON.parse(await fs.promises.readFile(this.path, {encoding: 'utf8'}));

            return products;
        } else {
            return [];
        }
    }

    static async addProduct(product = {}) {
        let products = await this.getProducts();

        let id = 1;
        if (products.length > 0) {
            id = Math.max(...products.map(p => p.id)) + 1;
        }

        let newProduct = {
            id,
            ...product
        }

        products.push(newProduct);

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));

        return newProduct;
    }

    static async updateProduct(id, toModify) {
        let products = await this.getProducts();

        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            throw new Error(`Error: ID ${id} does not exist.`);
        }

        let filteredProperties = {};
        Object.keys(toModify).forEach(key => {
            if (key in this.baseProductStructure) {
                filteredProperties[key] = toModify[key];
            }
        });

        products[productIndex] = {
            ...products[productIndex],
            ...filteredProperties,
            id
        }

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));

        return products[productIndex];
    }

    static async deleteProduct(id) {
        let products = await this.getProducts();

        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            throw new Error(`Error: Product with ID ${id} does not exist.`);
        }

        const qty0 = products.length;
        products = products.filter(p => p.id !== id);

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));

        const qty1 = products.length;

        return qty0 - qty1;
    }

    static async checkProductExists(id) {
        let products = await this.getProducts();
        const product = products.find(p => p.id === id);

        return product ? true : false;
    }
}
