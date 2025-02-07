import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Product } from "./Product";
import { Order } from "./Order";


@Entity("ProductsItems")
export class ProductItem {
    @PrimaryGeneratedColumn({name: 'id'})
    _id!: number;

    @Column("int", {name: 'quantity'})
    private _quantity: number;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({name: 'productId'})
    private _product: Product;

    @ManyToOne(() => Order)
    @JoinColumn({name: 'orderId'})
    private _order: Order;


    constructor(product: Product, quantity: number, order: Order) {
        this._product = product;
        this._quantity = quantity;
        this._order = order;
    }

    get product(): Product {
        return this._product;
    }

    set product(value: Product) {
        this._product = value;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }

    get order(): Order {
        return this._order;
    }

    set order(value: Order) {
        this._order = value;
    }

}
