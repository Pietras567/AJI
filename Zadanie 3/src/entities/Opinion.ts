import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { Order } from "./Order";

@Entity("Opinions")
export class Opinion {
    @PrimaryGeneratedColumn()
    private _id!: number;

    @Column({ type: "int", width: 1 })
    private _rating: number; // Ocena (1-5)

    @Column("text")
    private _content: string; // Treść opinii

    @ManyToOne(() => Order, (order) => order.opinions, { onDelete: "CASCADE" })
    @JoinColumn({name: '_order_id'})
    _order: Order;


    constructor( rating: number, content: string, order: Order) {
        this._rating = rating;
        this._content = content;
        this._order = order;
    }


    get order(): Order {
        return this._order;
    }

    set order(value: Order) {
        this._order = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get rating(): number {
        return this._rating;
    }

    set rating(value: number) {
        this._rating = value;
    }

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

}
