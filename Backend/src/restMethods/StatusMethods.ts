import {Request, Response} from 'express';
import {OrderStatus} from '../entities/OrderStatus';
import "reflect-metadata";
import {AppDataSource} from "../index";
import app from "../app";
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