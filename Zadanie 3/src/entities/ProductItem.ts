import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { Order } from "./Order";


@Entity("ProductsItems")
export class ProductItem {
    @PrimaryGeneratedColumn()
    _id!: number;

    @Column("int")
    private _quantity: number;

    @ManyToOne(() => Product, { eager: true })
    private _product: Product;

    @ManyToOne(() => Order)
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
