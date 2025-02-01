import express from 'express';
import bodyParser from 'body-parser';
import {DataSource} from "typeorm";
import {ProductItem} from "./entities/ProductItem";
import {Category} from "./entities/Category";
import {Order} from './entities/Order';
import {Product} from './entities/Product';
import {OrderStatus} from './entities/OrderStatus';
import {User} from "./entities/User"
import "reflect-metadata";
import {Opinion} from "./entities/Opinion";
import {Account} from "./entities/Account";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import {app} from "./app"
import "./restMethods/CategoryMethods";
import "./restMethods/InitialisationMethods";
import "./restMethods/OpinionMethods";
import "./restMethods/ProductMethods";
import "./restMethods/OrderMethods";
import "./restMethods/SeoOptimalisationMethods";
import "./restMethods/StatusMethods";
import "./restMethods/UserAccountMethods";

require('dotenv').config({path: './secret.env'});
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "AJI",
    password: "AJI",
    database: "AJI",
    synchronize: true,
    logging: true,
    // entities: ['./entities/*.{js,ts}'],
    entities: [Category, ProductItem, Order, Product, OrderStatus, User, Opinion, Account],

});

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

async function initializeOrderStatuses() {

    const statuses = [
        "NotApproved",
        "Approved",
        "Cancelled",
        "Executed",
    ];

    for (const name of statuses) {
        await addOrderStatus(name);
    }
    console.log("Order statuses initialized successfully.");
}

async function addOrderStatus(name: string) {
    const orderStatusRepository = AppDataSource.getRepository(OrderStatus);

    // @ts-ignore
    const existingStatus = await orderStatusRepository.findOneBy({_currentStatus: name});

    if (!existingStatus) {
        const newStatus = new OrderStatus(name);
        await orderStatusRepository.save(newStatus);
        console.log(`Status '${name}' added.`);
    } else {
        console.log(`Status '${name}' already exists.`);
    }
}

async function initializeCategories() {
    const categories = [
        "Electronics",
        "Clothing",
        "Books",
        "Toys",
    ];

    for (const name of categories) {
        await addCategory(name);
    }

    console.log("Categories initialized successfully.");
}

async function addCategory(name: string,) {
    const categoryRepository = AppDataSource.getRepository(Category);

    // @ts-ignore
    const existingCategory = await categoryRepository.findOneBy({_name: name});

    if (!existingCategory) {
        const newCategory = new Category(name);
        await categoryRepository.save(newCategory);
        console.log(`Category '${name}' added.`);
    } else {
        console.log(`Category '${name}' already exists.`);
    }
}

startServer()
    .then(() => initializeOrderStatuses())
    .then(() => initializeCategories())
    .then(() => {
        console.log("Server started.");
    })
    .catch((error) => {
        console.error("Error occured:", error);
    });
