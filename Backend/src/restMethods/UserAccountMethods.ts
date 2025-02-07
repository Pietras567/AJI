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
import * as dotenv from "dotenv";

require('dotenv').config({path: './secret.env'});
dotenv.config();

// @ts-ignore
app.post('/users', authenticateJWT(["MANAGER"]), async (req: Request, res: Response) => {
    try {
        //Pobranie i sprawdzenie danych wejściowych
        const {userName, email, phone} = req.body;

        if (!userName || userName.trim() === "") {
            res.status(400).json({error: "User name cannot be empty."});
            return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            res.status(400).json({error: "Invalid email address."});
            return;
        }
        if (!phone || !/^\d{9}$/.test(phone)) {
            res.status(400).json({error: "Phone number must contain exactly 9 digits."});
            return;
        }

    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Internal Server Error");
    }
});

// @ts-ignore
app.post('/login', async (req: Request, res: Response) => {
    const {userName, password} = req.body;

    const secretKey: string = process.env.JWT_SECRET!;
    const expireTime: string = process.env.JWT_EXPIRATION!;

    try {

        const accountRepository = AppDataSource.getRepository(Account);

        // @ts-ignore
        const account = await accountRepository.findOne({where: {_userName: userName}});

        if (!account || !(await account.validatePassword(password))) {
            return res.status(401).json({error: "Invalid username or password"});
        }

        // @ts-ignore
        const token = jwt.sign(
            {id: account.id, userName: account.userName, accountType: account.accountType},
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
        const user = await userRepository.findOne({where: {_userName: account.userName}, relations: ['_account']})
        if (user != null) {
            return res.status(200).json({'accountType': account.accountType , 'userId': user.id});
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post('/register', async(req: Request, res: Response) => {
    const {userName, password, email, phone} = req.body;

    try {
        const accountRepository = AppDataSource.getRepository(Account);
        const userRepository = AppDataSource.getRepository(User);

        // @ts-ignore
        const account = await accountRepository.findOne({where: {_userName: userName}});
        if(account) {
            res.status(409).send("User with this name arleady exists");
            return;
        }

        // @ts-ignore
        const user = await userRepository.findOne({where: {_userName: userName}});
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

        let newAccount: Account = new Account(userName, password, "CLIENT");
        await newAccount.hashPassword();
        let newUser: User = new User(userName, email, phone, newAccount);

        await accountRepository.save(newAccount);
        await userRepository.save(newUser);

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

        const decoded = jwt.decode(token) as { id: number; userName: string; accountType: string; exp: number };
        // Pobranie użytkownika z bazy danych
        const accountRepository = AppDataSource.getRepository(Account);
        // @ts-ignore
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
            {id: account.id, userName: account.userName, accountType: account.accountType},
            secretKey!,
            {expiresIn: expireTime}
        );

        return res.status(200).json({token: newToken});
    } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(403).json({error: "Invalid or expired token"});
    }
});

