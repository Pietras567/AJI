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

//Pobierz dozwolone stany zamówień
app.get('/status', async (req: Request, res: Response) => {
    try {
        const orderStatusRepository = AppDataSource.getRepository(OrderStatus);
        const orderStatuses = await orderStatusRepository.find();
        res.json(orderStatuses);
    } catch (error) {
        console.error("Error fetching order statuses:", error);
        res.status(500).send("Internal Server Error");
    }
});