import { config } from "./src/config/config.js";
import readline from 'readline';
import { connDB } from "./src/connDB.js";
import { cartsModel } from './src/dao/models/cartsModel.js';
import { productsModel } from './src/dao/models/productsModel.js';

const generateData = async () => {
    await productsModel.deleteMany({});
    const products = generateRandomProducts();
    const insertedProducts = await productsModel.insertMany(products);

    await cartsModel.deleteMany({});
    const carts = generateRandomCarts(insertedProducts);
    await cartsModel.insertMany(carts);

    console.log(`Data has been generated successfully.`);
};

const generateRandomProducts = () => {
    const categories = ['Electronics', 'Clothing', 'Books', 'Toys', 'Furniture'];
    const products = [];

    for (let i = 1; i <= 20; i++) {
        products.push({
            title: `Product ${i}`,
            description: `Description for product ${i}`,
            code: i,
            price: Math.floor(Math.random() * 1000) + 1,
            status: Math.random() > 0.5,
            stock: Math.floor(Math.random() * 100) + 1,
            category: categories[Math.floor(Math.random() * categories.length)],
            thumbnails: []
        });
    }

    return products;
};

const generateRandomCarts = (products) => {
    const carts = [];

    for (let i = 1; i <= 20; i++) {
        const cartProducts = [];
        const numProducts = Math.floor(Math.random() * 5) + 1;

        for (let j = 0; j < numProducts; j++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            cartProducts.push({
                product: randomProduct._id,
                quantity: Math.floor(Math.random() * 10) + 1
            });
        }

        carts.push({ products: cartProducts });
    }

    return carts;
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

rl.question('Enter password: ', async (password) => {
    if (password === "coder") {
        await connDB(config.MONGO_URL, config.DB_NAME);
        await generateData();
    } else {
        console.log(`Incorrect password`);
    }

    rl.close();
});
