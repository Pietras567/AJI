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


//Pobierz zamówienia
app.get('/orders', async (req: Request, res: Response) => {
    try {
        const ordersRepository = AppDataSource.getRepository(Order);
        const productItemRepository = AppDataSource.getRepository(ProductItem);
        const orders = await ordersRepository.find();

        const ordersWithProducts = await Promise.all(
            orders.map(async (order) => {
                const productItems = await productItemRepository.find({
                    // @ts-ignore
                    where: {_order: order},
                    relations: ["_product"]
                });

                return {...order, productList: productItems};
            })
        );

        res.json(ordersWithProducts);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});

//Pobierz zamówienia
// @ts-ignore
app.get('/orders/clients/:id', async (req: Request, res: Response) => {
    try {
        var id = parseInt(req.params.id);

        const ordersRepository = AppDataSource.getRepository(Order);
        const productItemRepository = AppDataSource.getRepository(ProductItem);

        const usersRepository = AppDataSource.getRepository(User);
        // @ts-ignore
        const user = await usersRepository.findOne({ where: { _id: id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const orders = await ordersRepository.find({
            // @ts-ignore
            where: { _user: user }, // Bezpośrednie odwołanie do użytkownika
            relations: ["_user"],  // Dodaj relacje, jeśli są potrzebne
        });

        const ordersWithProducts = await Promise.all(
            orders.map(async (order) => {
                const productItems = await productItemRepository.find({
                    // @ts-ignore
                    where: {_order: order},
                    relations: ["_product"]
                });

                return {...order, productList: productItems};
            })
        );

        res.json(ordersWithProducts);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});


//Dodaj zamówienie
// @ts-ignore
app.post('/orders', authenticateJWT(), async (req: Request, res: Response) => {
    try {
        const {statusId, userId, orderDate, products} = req.body;

        //Pobranie i sprawdzenie kategorii
        const orderStatusRepository = AppDataSource.getRepository(OrderStatus);

        const status = await orderStatusRepository.findOne({
            // @ts-ignore
            where: {_id: statusId}
        });

        if (!status) {
            res.status(404).json({error: `Order status with ID ${statusId} not found.`});
            return;
        }

        // Pobranie i sprawdzenie użytkownika
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
            // @ts-ignore
            where: {_id: userId}
        });

        if (!user) {
            res.status(404).json({error: `User with ID ${userId} not found.`});
            return;
        }

        //Dodanie zamówienia
        const orderRepository = AppDataSource.getRepository(Order);

        // @ts-ignore
        const order = orderRepository.create({
            _status: status,
            _user: user,
            _orderDate: new Date(orderDate),
            _totalPrice: 0,
        });
        await orderRepository.save(order);

        //Dodanie produktów do zamówienia
        const productItemRepository = AppDataSource.getRepository(ProductItem);
        const productRepository = AppDataSource.getRepository(Product);

        const productReturnList: ProductItem[] = []

        var totalPrice = 0;

        for (const productData of products) {
            // @ts-ignore
            const product = await productRepository.findOne({where: {_id: productData.productId}});
            if (!product) {
                res.status(404).json({error: `Product with ID ${productData.productId} not found`});
                return;
            }

            if (!productData.quantity || productData.quantity <= 0) {
                res.status(400).json({
                    error: `Product quantity for product ID ${productData.productId} must be greater than zero.`
                });
                return;
            }

            // @ts-ignore
            const productItem = productItemRepository.create({
                _product: product,
                _quantity: productData.quantity,
                _order: order
            });
            //console.log(productItem);

            productReturnList.push(productItem);

            await productItemRepository.save(productItem);

            totalPrice += productData.quantity * product.price;

        }

        order.totalPrice = totalPrice;
        await orderRepository.save(order);

        function replacer(key: string, value: any) {
            if (key === '_order') {
                return undefined; // Usuwa cykliczne odwołanie
            }
            return value;
        }

        const fullOrderDetails = {
            ...order,
            productList: productReturnList
        };

        res.status(201).json(JSON.parse(JSON.stringify(fullOrderDetails, replacer)));
    } catch (error) {
        console.error("Error adding order:", error);
        res.status(500).send("Internal Server Error");
    }
});


//Edytuj zamówienie
// @ts-ignore
app.patch('/orders/:id', authenticateJWT(["MANAGER"]), async (req: Request, res: Response) => {
    try {
        const {statusId} = req.body;
        const orderRepository = AppDataSource.getRepository(Order);

        const order = await orderRepository.findOne({
            // @ts-ignore
            where: {_id: parseInt(req.params.id)},
            relations: ["_status"]
        });


        if (order) {
            const orderStatusRepository = AppDataSource.getRepository(OrderStatus);
            // @ts-ignore
            const status = await orderStatusRepository.findOne({where: {_id: statusId}});

            if (!status) {
                res.status(404).json({error: `Order status with ID ${statusId} not found.`});
                return;
            }

            // Definicja dozwolonych przejść statusów
            const statusHierarchy: { [key: string]: number } = {
                NotApproved: 1,
                Approved: 2,
                Executed: 3,
                Cancelled: 4,
            };

            const currentStatusLevel = statusHierarchy[order.status.currentStatus];
            const newStatusLevel = statusHierarchy[status.currentStatus];

            // Walidacja przejścia między statusami
            if (currentStatusLevel === 4 || currentStatusLevel === 3) {
                res.status(400).json({
                    error: `Cannot change status from '${order.status.currentStatus}' as it is a final status.`,
                });
                return;
            }

            if (
                currentStatusLevel > newStatusLevel &&
                !(currentStatusLevel !== 4 && status.currentStatus === "Cancelled")
            ) {
                res.status(400).json({
                    error: `Invalid status transition from '${order.status.currentStatus}' to '${status.currentStatus}'.`,
                });
                return;
            }

            order.status = status;
            await orderRepository.save(order);
            res.json(order);
        } else {
            res.status(404).json({error: `Order with ID ${req.params.id} not found.`});
            return;
        }


    } catch (error) {
        console.error("Error updating order: ", error);
        res.status(500).send("Internal Server Error");
    }
});


//Pobierz zamówienia z określonym stanem
app.get('/orders/status/:id', async (req: Request, res: Response) => {
    try {
        const ordersRepository = AppDataSource.getRepository(Order);
        const orderStatusRepository = AppDataSource.getRepository(OrderStatus);

        const orderStatus = await orderStatusRepository.findOne({
            // @ts-ignore
            where: {_id: parseInt(req.params.id)}
        })
        //console.log(orderStatus)
        if (!orderStatus) {
            res.status(404).send("Status not found");
            return;
        }

        const orders = await ordersRepository.find({
            // @ts-ignore
            where: {_status: orderStatus}
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});


