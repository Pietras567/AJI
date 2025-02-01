import {Request, Response} from 'express';
import {Category} from "../entities/Category";
import {Product} from '../entities/Product';
import "reflect-metadata";
import {AppDataSource} from "../index";
import {app} from "../app";
import {authenticateJWT} from "../authenticationJWT";

//D3
//Inicjalizacja towarów w bazie danych na podstawie pliku.
// @ts-ignore
app.post("/init", authenticateJWT(["MANAGER"]), async (req: Request, res: Response) => {
    try {
        const productData = req.body; // Zawiera listę produktów (dane JSON)

        // Sprawdzamy, czy w bazie danych już istnieją produkty
        const existingProducts = await AppDataSource.getRepository(Product).find();

        if (existingProducts.length > 0) {
            return res.status(400).json({error: "Database already contains products."});
        }

        // Proces inicjalizacji danych produktów
        for (let data of productData) {
            const {_name, _description, _price, _weight, categoryId} = data;

            // Walidacja danych, jeśli jest to potrzebne
            if (!_name || _name.trim() === "") {
                return res.status(400).json({error: "Product name cannot be empty."});
            }
            if (!_description || _description.trim() === "") {
                return res.status(400).json({error: "Product description cannot be empty."});
            }
            if (!_price || _price <= 0) {
                return res.status(400).json({error: "Product price must be greater than zero."});
            }
            if (!_weight || _weight <= 0) {
                return res.status(400).json({error: "Product weight must be greater than zero."});
            }

            const categories = AppDataSource.getRepository(Category);
            // @ts-ignore
            const _category = await categories.findOne({where: {_id: categoryId}});
            if (!_category) {
                res.status(404).send("Category not found");
                return;
            }

            // Tworzymy nowy produkt
            const newProduct = new Product(_name, _description, _price, _weight, _category);

            // Zapisujemy produkt do bazy danych
            await AppDataSource.getRepository(Product).save(newProduct);
        }

        return res.status(200).json({message: "Products initialized."});
    } catch (error) {
        // console.error("Error during product initialization:", error);
        return res.status(500).json({error: "Error occured."});
    }
});