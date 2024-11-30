import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import {OrderStatus} from "./OrderStatus"
import {Product} from "./Product"
import {ProductItem} from "./ProductItem";
import {User} from "./User"


@Entity("Orders")
export class Order {
  @PrimaryGeneratedColumn()
  private _id!: number;

  @Column("timestamp")
  private _orderDate?: Date;

  @ManyToOne(() => OrderStatus, { eager: true })
  private _status: OrderStatus;

  @ManyToOne(() => User, { eager: true })
  private _user: User;

  @OneToMany(() => ProductItem, (item: ProductItem) => item.order, { cascade: true })
  private _productList!: ProductItem[];

  constructor(status: OrderStatus, user: User, orderDate?: Date) {
    this._status = status;
    this._user = user;
    this._orderDate = orderDate;
  }

  get orderDate(): Date | undefined {
    return this._orderDate;
  }

  set orderDate(value: Date) {
    this._orderDate = value;
  }

  get status(): OrderStatus {
    return this._status;
  }

  set status(value: OrderStatus) {
    this._status = value;
  }

  get user(): User {
    return this._user;
  }

  set user(value: User) {
    this._user = value;
  }

  get productList(): ProductItem[] {
    return this._productList;
  }

  set productList(value: ProductItem[]) {
    this._productList = value;
  }

  get id(): number {
    return this._id;
  }
}