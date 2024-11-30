import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {ProductItem} from "./ProductItem";
import {Order} from "./Order";


@Entity("OrderStatuses")
export class OrderStatus {
    @PrimaryGeneratedColumn()
    private _id!: number;

    @Column({
        type: "enum",
        enum: ["NotApproved", "Approved", "Cancelled", "Executed"],
    })
    private _currentStatus: string;

    @OneToMany(() => Order, (item: Order) => item.status, { cascade: true })
    private _orders!: Order[];

    constructor(currentStatus: string) {
        this._currentStatus = currentStatus;
    }

    get currentStatus(): string {
        return this._currentStatus;
    }

    set currentStatus(value: string) {
        this._currentStatus = value;
    }

    get id(): number {
        return this._id;
    }
}