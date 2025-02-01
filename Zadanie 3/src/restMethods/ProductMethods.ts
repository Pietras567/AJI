import express, {NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {DataSource, Equal, ObjectLiteral} from "typeorm";
import {ProductItem} from "../entities/ProductItem";
import {Category} from "../entities/Category";
import {Order} from '../entities/Order';
import {Product} from '../entities/Product';
import {OrderStatus} from '../entities/OrderStatus';
import {User} from "../entities/User"
import "reflect-metadata";
import axios from "axios";
import {Opinion} from "../entities/Opinion";
import {Account} from "../entities/Account";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import {AppDataSource} from "../index";
import {app} from "../app";
import {authenticateJWT} from "../authenticationJWT";


//Pobierz produkty
app.get('/products', async (req: Request, res: Response) => {
    try {
        const products = AppDataSource.getRepository(Product);
        res.json(await products.find());
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Pobierz produkt po id
app.get('/products/:id', async (req: Request, res: Response) => {
    try {
        const products = AppDataSource.getRepository(Product);
        // @ts-ignore
        const findProduct = await products.findOne({where: {_id: parseInt(req.params.id)}});
        if (findProduct) {
            res.json(findProduct);
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Dodaj produkt
// @ts-ignore
app.post('/products', authenticateJWT(["MANAGER"]), async (req: Request, res: Response) => {
    try {
        const {_name, _description, _price, _weight, categoryId} = req.body;

        if (!_name || _name.trim() === "") {
            res.status(400).json({error: "Product name cannot be empty."});
            return
        }
        if (!_description || _description.trim() === "") {
            res.status(400).json({error: "Product description cannot be empty."});
            return
        }
        if (!_price || _price <= 0) {
            res.status(400).json({error: "Product price must be greater than zero."});
            return
        }
        if (!_weight || _weight <= 0) {
            res.status(400).json({error: "Product weight must be greater than zero."});
            return
        }

        const categories = AppDataSource.getRepository(Category);
        // @ts-ignore
        const _category = await categories.findOne({where: {_id: categoryId}});
        if (!_category) {
            res.status(404).send("Category not found");
            return;
        }

        const products = AppDataSource.getRepository(Product);
        // @ts-ignore
        const newProduct = products.create({_name, _description, _price, _weight, _category});
        await products.save(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Aktualizuj product
// @ts-ignore
app.put('/products/:id', authenticateJWT(["MANAGER"]), async (req: Request, res: Response) => {
    try {
        const {_name, _description, _price, _weight, categoryId} = req.body;

        if (!_name || _name.trim() === "") {
            res.status(400).json({error: "Product name cannot be empty."});
            return
        }
        if (!_description || _description.trim() === "") {
            res.status(400).json({error: "Product description cannot be empty."});
            return
        }
        if (!_price || _price <= 0) {
            res.status(400).json({error: "Product price must be greater than zero."});
            return
        }
        if (!_weight || _weight <= 0) {
            res.status(400).json({error: "Product weight must be greater than zero."});
            return
        }

        const products = AppDataSource.getRepository(Product);
        // @ts-ignore
        const product = await products.findOne({where: {_id: parseInt(req.params.id)}});

        if (product) {
            const categories = AppDataSource.getRepository(Category);
            // @ts-ignore
            const _category = await categories.findOne({where: {_id: categoryId}});
            if (!_category) {
                res.status(404).send("Category not found");
                return;
            }

            product.name = _name;
            product.description = _description;
            product.price = _price;
            product.weight = _weight;
            product.category = _category

            await products.save(product);
            res.json(product);
        } else {
            res.status(404).json({error: `Product with ID ${req.params.id} does not exist.`});
            return;
        }
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
    }
})