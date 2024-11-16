import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {DataSource} from "typeorm";
import {ProductItem} from "./entities/ProductItem";
import {Category} from './entities/Category';
import {Order} from './entities/Order';
import {Product} from './entities/Product';
import {OrderStatus} from './entities/OrderStatus';
import "reflect-metadata";


const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "shop_db",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    synchronize: true,
    logging: true
});

const AppDataSource5 = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    entities: [ProductItem, Category, Order, Product, OrderStatus],
    synchronize: true,
    logging: true
});


const app = express();
app.use(bodyParser.json());

let products: Product[] = [];
let categories: Category[] = [];
let orders: Order[] = [];

async function startServer() {
    try {
        console.log(AppDataSource.options.entities);

        await AppDataSource.initialize();
        console.log("Database connection established.");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
    }
}

async function addProductAndOrder() {
    const categoryRepository = AppDataSource.getRepository(Category);
    const productRepository = AppDataSource.getRepository(Product);
    const orderRepository = AppDataSource.getRepository(Order);
    const statusRepository = AppDataSource.getRepository(OrderStatus);

    const category = new Category("Electronics");
    await categoryRepository.save(category);

    const product = new Product("Smartphone", "High-end smartphone", 999.99, 0.5, category);

    await productRepository.save(product);
    console.log("Product saved:", product);

    // Create or find status
    const status = new OrderStatus("Approved");
    await statusRepository.save(status);

    // Get a product
    const product2 = await productRepository.findOne({
        where: { id: 1 },
    });

    // Create product item
    const productItem = new ProductItem(product2!, 2);

    // Create an order
    const order = new Order(status, "John Doe", "john@example.com", "1234567890", new Date());
    order.productList = [productItem];

    await orderRepository.save(order);
    console.log("Order saved:", order);
}

startServer();
addProductAndOrder();
