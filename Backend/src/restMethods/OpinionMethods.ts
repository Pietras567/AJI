import {Request, Response} from 'express';
import {ProductItem} from "../entities/ProductItem";
import {Order} from '../entities/Order';
import {User} from "../entities/User"
import "reflect-metadata";
import {Opinion} from "../entities/Opinion";
import {AppDataSource} from "../index";
import app from "../app";
import {authenticateJWT} from "../authenticationJWT";

// D4
// Dodawanie opinii po zakupie

// @ts-ignore
app.post('/orders/:id/opinions', authenticateJWT(["CLIENT"]), async (req: Request, res: Response) => {
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
            where: {_id: order.user.id},
            relations: ["_account"],
        })) as User;


        if (!order) {
            return res.status(404).json({error: "Order not found"});
        }

        if (res.locals.accountId !== userFromOrder.account.id) {
            return res.status(403).json({error: "You can only add opinions to your own orders"});
        }

        const allowedStatuses = ["Executed", "Cancelled"]
        if (!allowedStatuses.includes((order.status.currentStatus))) {
            return res.status(400).json({error: "Cannot add opinion to an order that is not completed or cancelled"});
        }


        const existingOpinion = await opinionRepository.findOne({
            // @ts-ignore
            where: { _order: { _id: order.id } },
        });

        if (existingOpinion) {
            return res.status(400).json({ error: "An opinion has already been added to this order" });
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
// app.get('/orders/:id/opinions',authenticateJWT(), async (req: Request, res: Response) => {
//     const { id } = req.params;
//
//     try {
//         const orderRepository = AppDataSource.getRepository(Order);
//         const opinionRepository = AppDataSource.getRepository(Opinion);
//
//
//         const order = await orderRepository.findOne({
//             // @ts-ignore
//             where: { _id: parseInt(id) },
//             relations: ["_opinions"],
//         });
//
//         if (!order) {
//             return res.status(404).json({ error: "Order not found" });
//         }
//
//         const userRepository = AppDataSource.getRepository(User);
//
//         const userFromOrder = await userRepository.findOne({
//             // @ts-ignore
//             where: { _id: order._user.id },
//             relations: ["_account"],
//         });
//
//         if (res.locals.accountId !== userFromOrder?._account._id) {
//             return res.status(403).json({ error: "You can only view opinions for your own orders" });
//         }
//
//         // @ts-ignore
//         const opinions = order._opinions;
//
//         // const opinions2 = opinionRepository.find({
//         //     // @ts-ignore
//         //     where: {Order_id : parseInt(id)},
//         //     relations: ["_order"]
//         //     }
//         // )
//         return res.status(200).json(opinions);
//     } catch (error) {
//         console.error("Error fetching opinions:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

app.get('/opinions/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const opinionRepository = AppDataSource.getRepository(Opinion);
        const productItemRepository = AppDataSource.getRepository(ProductItem);

        const opinions = await opinionRepository.find({
            relations: ["_order"]
        });

        console.log(opinions)

        const returnOpinions = [];

        for (const opinion of opinions) {
            const id = opinion.order;

            const items = await productItemRepository.find({
                // @ts-ignore
                where: { _order: id },
            });

            console.log(items)
            for (const product of items) {
                if (product.product.id === parseInt(productId)) {
                    returnOpinions.push(opinion);
                }
            }
        }

        if (!returnOpinions || returnOpinions.length === 0) {
            return res.status(404).json({ error: "No opinions found for this product" });
        }

        const opinionDetails = returnOpinions.map(opinion => ({
            id: opinion.id,
            content: opinion.content,
            rating: opinion.rating,
            orderId: opinion.order.id,
            productId: productId,
        }));

        return res.status(200).json(opinionDetails);
    } catch (error) {
        console.error("Error fetching opinions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// @ts-ignore
app.get('/opinions', authenticateJWT(), async (req: Request, res: Response) => {
    try {
        const userId = res.locals.accountId;

        const opinionRepository = AppDataSource.getRepository(Opinion);
        const orderRepository = AppDataSource.getRepository(Order);
        const userRepository = AppDataSource.getRepository(User);

        // Fetch all opinions for the user by checking orders linked to the user

        const opinions = await opinionRepository.find({
            relations: ["_order"], // Load the associated order for each opinion
            // @ts-ignore
            where: {
                _order: { _user: { _id: userId } }
            }
        });

        if (!opinions || opinions.length === 0) {
            return res.status(404).json({ error: "No opinions found for this user's orders" });
        }

        // @ts-ignore
        const opinionDetails = opinions.map(opinion => ({
            // @ts-ignore
            id: opinion._id,
            // @ts-ignore
            content: opinion._content,
            // @ts-ignore
            rating: opinion._rating,
            // @ts-ignore
            orderId: opinion._order._id,
        }));

        return res.status(200).json(opinionDetails);
    } catch (error) {
        console.error("Error fetching opinions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});