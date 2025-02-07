import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {AppDataSource} from "./index";
import {Account} from "./entities/Account";
import * as dotenv from "dotenv";

require('dotenv').config({path: './secret.env'});
dotenv.config();

export const authenticateJWT = (allowedRoles?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // const authHeader = req.headers.authorization;
        // const authHeader = req.cookies.authToken;
        //
        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     return res.status(401).json({error: "Unauthorized"});
        // }


        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        // const token = authHeader.split(" ")[1];

        try {


            const secretKey = process.env.JWT_SECRET!;
            const expireTime = process.env.JWT_EXPIRATION!;

            //const secretKey = "213742069"
            //const expireTime = "1h"

            // Weryfikacja tokenu
            // const decoded  = jwt.verify(token, process.env.JWT_SECRET!);
            const decoded = jwt.verify(token, secretKey);

            console.log("Payload:", decoded);

            type JwtPayload = {
                id: number;
                userName: string;
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
                if (allowedRoles && !allowedRoles.includes(account.accountType)) {
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