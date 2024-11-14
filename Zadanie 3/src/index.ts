import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Category } from './Category';
import { Order } from './Order';
import { Product } from './Product';
import { OrderStatus, Status } from './OrderStatus';

const app = express();
app.use(bodyParser.json());

let products: Product[] = [];
let categories: Category[] = [];
let orders: Order[] = [];


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

