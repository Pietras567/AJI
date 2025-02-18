import {Request, Response} from 'express';
import {Category} from "../entities/Category";
import "reflect-metadata";
import {AppDataSource} from "../index";
import app from "../app";
import {authenticateJWT} from "../authenticationJWT";

//Pobierz kategorie
app.get('/categories', async (req: Request, res: Response) => {
    try {
        const categoriesRepository = AppDataSource.getRepository(Category);
        const categories = await categoriesRepository.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
    }
});