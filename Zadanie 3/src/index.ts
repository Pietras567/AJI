import express, {NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {DataSource, ObjectLiteral} from "typeorm";
import {ProductItem} from "./entities/ProductItem";
import {Category} from "./entities/Category";
import {Order} from './entities/Order';
import {Product} from './entities/Product';
import {OrderStatus} from './entities/OrderStatus';
import {User} from "./entities/User"
import "reflect-metadata";
import axios from "axios";
import {Opinion} from "./entities/Opinion";
import {Account} from "./entities/Account";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

require('dotenv').config({path: './secret.env'});
dotenv.config();


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "AJI",
    password: "AJIPWD",
    database: "AJI_3DB",
    synchronize: true,
    logging: true,
    // entities: ['./entities/*.{js,ts}'],
    entities: [Category, ProductItem, Order, Product, OrderStatus, User, Opinion, Account],

});


const app = express();
const cors = require('cors');
app.use(cors());
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


export const authenticateJWT = (allowedRoles?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const token = authHeader.split(" ")[1];

        try {

            const secretKey = "213742069"
            const expireTime = "1h"

            // Weryfikacja tokenu
            // const decoded  = jwt.verify(token, process.env.JWT_SECRET!);
            const decoded = jwt.verify(token, secretKey);

            console.log("Payload:", decoded);

            type JwtPayload = {
                id: number;
                username: string;
                accountType: string;
                iat?: number;
                exp?: number;
            };

            const payload = decoded as JwtPayload;

            const accountId = payload.id;


            // const userRepository = AppDataSource.getRepository(User);
            const accountRepository = AppDataSource.getRepository(Account);

            const account = await accountRepository.findOne({
                // @ts-ignore
                where: {_id: accountId},
                // relations: ['_user'],
            });

            if (!account) {
                return res.status(404).json({error: "Account not found"});
            }


            if (allowedRoles != null) {
                // Jeśli sprawdzamy rolę, sprawdzamy, czy użytkownik ma odpowiednią rolę
                if (allowedRoles && !allowedRoles.includes(account._accountType)) {
                    return res.status(403).json({error: "Forbidden: Insufficient permissions"});
                }
            }
            res.locals.accountId = accountId;
            next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({error: "Invalid or expired token"});
        }
    };
};


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

//Pobierz kategorie
app.get('/categories', async (req: Request, res: Response) => {
    try {
        const categoriesRepository = AppDataSource.getRepository(Category);
        const categories = await categoriesRepository.find();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
    }
});


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


// @ts-ignore
app.post('/users', authenticateJWT(["MANAGER"]), async (req: Request, res: Response) => {
    try {
        //Pobranie i sprawdzenie danych wejściowych
        const {userName, email, phone} = req.body;

        if (!userName || userName.trim() === "") {
            res.status(400).json({error: "User name cannot be empty."});
            return
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            res.status(400).json({error: "Invalid email address."});
            return
        }
        if (!phone || !/^\d{9}$/.test(phone)) {
            res.status(400).json({error: "Phone number must contain exactly 9 digits."});
            return
        }

    } catch (error) {
        console.error("Error adding user:", error);
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
        });

        await orderRepository.save(order);

        //Dodanie produktów do zamówienia
        const productItemRepository = AppDataSource.getRepository(ProductItem);
        const productRepository = AppDataSource.getRepository(Product);

        const productReturnList: ProductItem[] = []

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

//D1
//Optymalizacja opisu produktu pod kątem SEO


async function generateSeoDescription(productData: any) {
    const apiKey = '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';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const seoDescriptionPrompt = `
You are an SEO expert. Your task is to take a product description and generate an SEO-optimized product description in HTML. The description should be structured and include the following:

1. The main title should be in <h1> and include the product's name and its main selling point.
2. Key features of the product should be listed in a <ul> with <li> tags.
3. A paragraph summarizing the product's benefits should be wrapped in a <p> tag.
4. Include the product's dimensions and weight as part of the description in a clear <p> tag.
5. Add a <meta description> tag in the HTML head for SEO optimization with relevant keywords.
6. The HTML should be clean and well-structured (no unnecessary newline characters or excessive formatting).
7. If the product has a price and category, include them clearly in <p> tags with strong emphasis on the price and category.
8. Ensure that all text is properly formatted and includes relevant SEO keywords.
9. Do not use unnecessary newlines (\n) or backticks.
10. If possible, add a clear call-to-action at the end of the description encouraging users to purchase the product.
11. You can use coloured text.

You will be given the details regarding the product in an upcoming message.
After analysing it, generate the HTML code with the SEO-optimized structure.
Do NOT add any unnecessary comments or notes regarding the generated code.
Always respond in English.

`;
// prompt generated using chatGPT

    const requestBody = {
        model: 'llama3-8b-8192',
        messages: [
            {
                role: 'system',
                content: seoDescriptionPrompt
            },
            {
                role: 'user',
                content: `Product Name: ${productData.name}, Description: ${productData.description}, Price: ${productData.price}, Weight: ${productData.weight}kg, Category: ${productData.category}.`
            }
        ]
    };

    try {
        // Wysyłamy zapytanie do Groq API
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            }
        });

        // Zwracamy wygenerowany HTML z odpowiedzi Groq
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw new Error("Failed to generate SEO description");
    }
}


// @ts-ignore
app.get('/products/:id/seo-description', async (req: Request, res: Response) => {
    try {
        // Pobieramy produkt z bazy danych

        const productId = parseInt(req.params.id);
        const productRepository = AppDataSource.getRepository(Product);
        const product = await productRepository.findOne({
            // @ts-ignore
            where: {_id: productId},
            relations: ["_category"]
        });

        // Sprawdzamy, czy produkt istnieje
        if (!product) {
            return res.status(404).json({error: "Product not found"});
        }

        // Przygotowujemy dane wejściowe do API Groq
        const productData = {
            name: product.name,
            description: product.description,
            price: product.price,
            weight: product.weight,
            category: product.category.name,
        };

        // Przesyłamy dane do API Groq, aby wygenerować SEO opis
        const seoDescription = await generateSeoDescription(productData);

        res.setHeader('Content-Type', 'text/html');

        // Zwracamy wygenerowany opis SEO w formacie HTML
        return res.status(200).send(seoDescription);
    } catch (error) {
        console.error("Error generating SEO description:", error);
        res.status(500).send("Internal Server Error");
    }
});

//D2
// Uwierzytelnianie do aplikacji

async function createAccounts() {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(5000);

    const accountRepository = AppDataSource.getRepository(Account);
    const userRepository = AppDataSource.getRepository(User);
    const orderRepository = AppDataSource.getRepository(Order);
    const productRepository = AppDataSource.getRepository(Product);
    const statusRepository = AppDataSource.getRepository(OrderStatus);
// Tworzymy konto "CLIENT"
    const clientAccount = new Account("sigmaManager", "haselko321", "MANAGER");
    await clientAccount.hashPassword();
    await accountRepository.save(clientAccount);
//
// // Tworzymy użytkownika przypisanego do konta "CLIENT"
//     const clientUser = new User("mala sigiemka", "sigma@example.pl", "123456789", clientAccount);
//     await userRepository.save(clientUser);

    // Get a product
    // const product2 = await productRepository.findOne({
    //     // @ts-ignore
    //     where: {_id: 1},
    // });

//     const user123 = await userRepository.findOne({
//         // @ts-ignore
//         where: {_id: 4},
//     }) as User;
//     ;
//
//     const status123 = await statusRepository.findOne({
//         // @ts-ignore
//         where: {_id: 2},
//     }) as OrderStatus;
//
// // Create an order
//
//
//     const order = new Order(status123, user123, new Date());
//
//     // Create product item
//     const productItem = new ProductItem(product2!, 2, order);
//
//     order.productList = [productItem];
//
//     await orderRepository.save(order);
//     console.log("Order saved:", order);
//

}


// @ts-ignore
app.post('/login', async (req: Request, res: Response) => {
    const {username, password} = req.body;

    const secretKey = "213742069"
    const expireTime = "1h"


    try {
        //const secret = process.env.JWT_SECRET
        //console.log(secret)
        //const expire = process.env.JWT_EXPIRATION
        //console.log(expire)
        //console.log(process.env)

        const accountRepository = AppDataSource.getRepository(Account);

        // @ts-ignore
        const account = await accountRepository.findOne({where: {_username: username}});

        if (!account || !(await account.validatePassword(password))) {
            return res.status(401).json({error: "Invalid username or password"});
        }

        // const token = jwt.sign(
        //     { id: account._id, username: account._username, accountType: account._accountType },
        //     process.env.JWT_SECRET!,
        //     { expiresIn: process.env.JWT_EXPIRATION }
        // );

        const token = jwt.sign(
            {id: account._id, username: account._username, accountType: account._accountType},
            secretKey,
            {expiresIn: expireTime}
        );


        res.status(200).json({'accountToken': token, 'accountId': account._id});
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/register', async(req: Request, res: Response) => {
    const {username, password, email, phone} = req.body;

    try {
        const accountRepository = AppDataSource.getRepository(Account);
        const userRepository = AppDataSource.getRepository(User);

        const account = await accountRepository.findOne({where: {_username: username}});
        if(account) {
            res.status(409).send("User with this name arleady exists");
            return;
        }

        // @ts-ignore
        const user = await userRepository.findOne({where: {_userName: username}});
        if(user) {
            res.status(409).send("User with this name arleady exists");
            return;
        }

        // @ts-ignore
        const user2 = await userRepository.findOne({where: {_email: email}});
        if(user2) {
            res.status(409).send("The email has already been used");
            return;
        }

        // @ts-ignore
        const user3 = await userRepository.findOne({where: {_phone: phone}});
        if(user3) {
            res.status(409).send("The phone number has already been used");
            return;
        }

        let newAccount: Account = new Account(username, password, "CLIENT");
        await newAccount.hashPassword();
        let newUser: User = new User(username,email,phone, newAccount);

        accountRepository.save(newAccount);
        userRepository.save(newUser);

        res.status(200).send("Account created");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});


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

// D4
// Dodawanie opinii po zakupie

// @ts-ignore
app.post('/orders/:id/opinions', authenticateJWT(["CLIENT"]), async (req: Request, res: Response) => {
    // const { id } = req.params;
    const {rating, content} = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({error: "Rating must be an integer between 1 and 5"});
    }

    if (!content || content.trim() === "") {
        return res.status(400).json({error: "Content cannot be empty"});
    }

    try {
        const orderRepository = AppDataSource.getRepository(Order);
        const opinionRepository = AppDataSource.getRepository(Opinion);
        const userRepository = AppDataSource.getRepository(User);

        // Pobierz zamówienie
        const order = (await orderRepository.findOne({
            // @ts-ignore
            where: {_id: parseInt(req.params.id)},
            relations: ["_user", "_opinions"],
        })) as Order;


        const userFromOrder = (await userRepository.findOne({
            // @ts-ignore
            where: {_id: order._user.id},
            relations: ["_account"],
        })) as User;


        if (!order) {
            return res.status(404).json({error: "Order not found"});
        }

        // @ts-ignore
        console.log("Order: " + JSON.stringify(order, null, 2))

        if (res.locals.accountId !== userFromOrder._account._id) {
            return res.status(403).json({error: "You can only add opinions to your own orders"});
        }

        const allowedStatuses = ["Executed", "Cancelled"]
        if (!allowedStatuses.includes((order.status.currentStatus))) {
            return res.status(400).json({error: "Cannot add opinion to an order that is not completed or cancelled"});
        }


        const newOpinion = new Opinion(rating, content, order);

        await opinionRepository.save(newOpinion);

        return res.status(201).json(newOpinion);
    } catch (error) {
        console.error("Error adding opinion:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// @ts-ignore
app.post("/refresh-token", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    const secretKey = "213742069"
    const expireTime = "1h"


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({error: "Unauthorized: No token provided"});
    }

    const token = authHeader.split(" ")[1];

    try {


        // jwt.verify(token, process.env.JWT_SECRET!, { ignoreExpiration: true });
        // jwt.verify(token, secretKey, { ignoreExpiration: true });


        const decoded = jwt.decode(token) as { id: number; username: string; accountType: string; exp: number };
        // Pobranie użytkownika z bazy danych
        const accountRepository = AppDataSource.getRepository(Account);
        const account = await accountRepository.findOne({where: {_id: decoded.id}});

        if (!account) {
            return res.status(404).json({error: "Account not found"});
        }

        // Sprawdzenie czasu ważności tokenu
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now; // Pozostały czas w sekundach

        if (timeLeft > 30 * 60) {
            // Jeśli do wygaśnięcia zostało więcej niż 30 minut, odrzuć żądanie
            return res.status(400).json({message: "Token is not close to expiring"});
        }


        // const newToken = jwt.sign(
        //     { id: account._id, username: account._username, accountType: account._accountType },
        //     process.env.JWT_SECRET!,
        //     { expiresIn: process.env.JWT_EXPIRATION }
        // );
        const newToken = jwt.sign(
            {id: account._id, username: account._username, accountType: account._accountType},
            secretKey!,
            {expiresIn: expireTime}
        );

        return res.status(200).json({token: newToken});
    } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(403).json({error: "Invalid or expired token"});
    }
});

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

async function addOrderStatus(name: string,) {
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
    // .then(() => createAccounts())
    .then(() => {
        console.log("Server started.");
    })
    .catch((error) => {
        console.error("Error occured:", error);
    });

