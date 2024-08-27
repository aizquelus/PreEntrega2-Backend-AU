import express from 'express';
import { engine } from 'express-handlebars';
import { router as productsRouter } from './routes/products.router.js';
import { router as cartsRouter } from './routes/carts.router.js';
import { router as viewsRouter } from './routes/views.router.js';
import __dirname from './utils.js';
import { createServer } from 'http';
import { Server } from 'socket.io'

const PORT = 8080;
const app = express();

const server = createServer(app);
const io = new Server(server);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Routes
app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter(io));

// Init server
server.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
