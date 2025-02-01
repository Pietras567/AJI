import {Request, Response} from 'express';
import {Order} from '../entities/Order';
import {Product} from '../entities/Product';
import {OrderStatus} from '../entities/OrderStatus';
import {User} from "../entities/User"
import "reflect-metadata";
import {Account} from "../entities/Account";
import jwt from "jsonwebtoken";
import {AppDataSource} from "../index";
import {app} from "../app";
import {authenticateJWT} from "../authenticationJWT";

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

        const accountRepository = AppDataSource.getRepository(Account);

        // @ts-ignore
        const account = await accountRepository.findOne({where: {_username: username}});

        if (!account || !(await account.validatePassword(password))) {
            return res.status(401).json({error: "Invalid username or password"});
        }


        const token = jwt.sign(
            {id: account._id, username: account._username, accountType: account._accountType},
            secretKey,
            {expiresIn: expireTime}
        );


        res.cookie("authToken", token, {
            httpOnly: true,
            secure: true,
            // @ts-ignore
            sameSite: "Strict",
            maxAge: 3600 * 1000,
        });

        const userRepository = AppDataSource.getRepository(User);
        // @ts-ignore
        const user = await userRepository.findOne({where: {_userName: account._username}, relations: ['_account']})
        // @ts-ignore
        console.log("id: " + user.id);
        // @ts-ignore
        console.log("username: " + user.userName);
        // @ts-ignore
        console.log("acc name: " + account._username);
        // @ts-ignore
        return res.status(200).json({'accountType': account._accountType , 'userId': user.id});
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Internal Server Error");
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

