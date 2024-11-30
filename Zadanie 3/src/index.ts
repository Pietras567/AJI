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
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "AJI",
    password: "AJIPWD",
    database: "AJI_3DB",
    synchronize: true,
    logging: true,
    entities: ["./entities/*.ts"],
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
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(5000);

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
        // @ts-ignore
        where: { _id: 1 },
    });

    // Create an order
    const order = new Order(status, "John Doe", "john@example.com", "1234567890", new Date());

    // Create product item
    const productItem = new ProductItem(product2!, 2, order);

    order.productList = [productItem];

    await orderRepository.save(order);
    console.log("Order saved:", order);
}

//Pobierz produkty
app.get('/products', async(req: Request, res: Response) => {
    try {
        const products = AppDataSource.getRepository(Product);
        res.json(await products.find());
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Pobierz produkt po id
app.get('/products/:id', async(req: Request, res: Response) => {
    try {
        const products = AppDataSource.getRepository(Product);
        // @ts-ignore
        const findProduct = await products.findOne({ where: { _id: parseInt(req.params.id) } });
        if (findProduct) {
            res.json(findProduct);
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Dodaj produkt
app.post('/products', async(req: Request, res: Response) => {
    try {
        const { _name, _description, _price, _weight, categoryId } = req.body;
        const categories = AppDataSource.getRepository(Category);
        // @ts-ignore
        const _category = await categories.findOne({ where: { _id: categoryId } });
        if(!_category) {
            res.status(404).send("Category not found");
            return;
        }

        const products = AppDataSource.getRepository(Product);
        // @ts-ignore
        const newProduct = products.create({ _name, _description, _price, _weight, _category });
        await products.save(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Aktualizuj product
app.put('/products/:id', async(req: Request, res: Response) => {
    try {
        const { _name, _description, _price, _weight, categoryId } = req.body;
        const products = AppDataSource.getRepository(Product);
        // @ts-ignore
        const product = await products.findOne({ where: { _id: parseInt(req.params.id) } });

        if(product) {
            const categories = AppDataSource.getRepository(Category);
            // @ts-ignore
            const _category = await categories.findOne({ where: { _id: categoryId } });
            if(!_category) {
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
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
})

//Pobierz kategorie
app.get('/categories', async(req: Request, res: Response) => {
    try {
        const categoriesRepository = AppDataSource.getRepository(Category);
        const categories = await categoriesRepository.find();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});



//Pobierz zamówienia
app.get('/orders', async(req: Request, res: Response) => {
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

                return { ...order, productList: productItems };
            })
        );

        res.json(ordersWithProducts);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});


//Dodaj zamówienie
app.post('/orders', async(req: Request, res: Response) => {
    try {
        //Pobranie i sprawdzenie kategorii
        const { statusId, userName, email, phone, orderDate, products } = req.body;
        const orderStatusRepository = AppDataSource.getRepository(OrderStatus);

        const status = await orderStatusRepository.findOne({
            // @ts-ignore
            where: { _id: statusId }
        });

        if (!status) {
            res.status(404).send("Status not found");
            return;
        }

        //Dodanie zamówienia

        const orderRepository = AppDataSource.getRepository(Order);

        // @ts-ignore
        const order = orderRepository.create({
            _status: status,
            _userName: userName,
            _email: email,
            _phone: phone,
            _orderDate: new Date(orderDate),
        });

        await orderRepository.save(order);

        //Dodanie produktów do zamówienia

        const productItemRepository = AppDataSource.getRepository(ProductItem);
        const productRepository = AppDataSource.getRepository(Product);

        const productReturnList: ProductItem[] = []

        for (const productData of products) {
            // @ts-ignore
            const product = await productRepository.findOne({ where: { _id: productData.productId } });
            if (!product) {
                res.status(404).send(`Product with ID ${productData.productId} not found`);
                return;
            }

            // @ts-ignore
            const productItem = productItemRepository.create({ _product: product, _quantity: productData.quantity, _order: order });
            //console.log(productItem);

            productReturnList.push(productItem);

            await productItemRepository.save(productItem);
        }

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
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});




//Edytuj zamówienie
app.patch('/orders/:id', async(req: Request, res: Response) => {
    try {
        const { statusId } = req.body;
        const orderRepository = AppDataSource.getRepository(Order);

        const order = await orderRepository.findOne({
            // @ts-ignore
            where: { _id: parseInt(req.params.id) },
            relations: ["_status"]
        });


        if (order) {
            const orderStatusRepository = AppDataSource.getRepository(OrderStatus);
            // @ts-ignore
            const status = await orderStatusRepository.findOne({ where: { _id: statusId } });

            if (!status) {
                res.status(404).send("Status not found");
                return;
            }

            order.status = status;
            await orderRepository.save(order);
            res.json(order);
        } else {
            res.status(404).send("Order not found");
            return;
        }


    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});



//Pobierz zamówienia z określonym stanem
app.get('/orders/status/:id', async(req: Request, res: Response) => {
    try {
        const ordersRepository = AppDataSource.getRepository(Order);
        const orderStatusRepository = AppDataSource.getRepository(OrderStatus);

        const orderStatus = await orderStatusRepository.findOne({
            // @ts-ignore
            where: { _id: parseInt(req.params.id) }
        })
        //console.log(orderStatus)
        if(!orderStatus) {
            res.status(404).send("Status not found");
            return;
        }

        const orders = await ordersRepository.find({
            // @ts-ignore
            where: { _status: orderStatus }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});




//Pobierz dozwolone stany zamówień
app.get('/status', async(req: Request, res: Response) => {
    try {
        const orderStatusRepository = AppDataSource.getRepository(OrderStatus);
        const orderStatuses = await orderStatusRepository.find();
        res.json(orderStatuses);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});

startServer();
addProductAndOrder();
