import  { productsModel } from './models/productsModel.js'

export class ProductsManager {

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

    static async getProducts (page, limit, query, sortByPrice, category) {
        let filter = {};

        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        const sort = {};
        if (sortByPrice === 'asc' || sortByPrice === 'desc') {
            sort.price = sortByPrice === 'asc' ? 1 : -1;
        }

        let products = await productsModel.paginate(filter, { lean: true, page, limit, sort });
        products.payload = products.docs;
        delete products.docs;

        return products;
    }

    static async getProductBy (filter) { 
        return await productsModel.findOne(filter).lean()
    }

    static async addProduct(product) {
        let newProduct = await productsModel.create(product)
        return newProduct.toJSON()
    }

    static async updateProduct(id, toModify) {
        return await productsModel.findByIdAndUpdate(id, toModify, {new: true}).lean();
    }

    static async deleteProduct(id) {
        return await productsModel.findByIdAndDelete(id, {new: true}).lean();
    }
}
