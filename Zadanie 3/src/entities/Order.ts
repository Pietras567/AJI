import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne} from "typeorm";
import {OrderStatus} from "./OrderStatus"
import {Product} from "./Product"
import {ProductItem} from "./ProductItem";
import {User} from "./User"
import { Opinion } from "./Opinion";

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

  @OneToMany(() => Opinion, (opinion) => opinion._order)
  private _opinions!: Opinion[];

  @Column("int")
  private _totalPrice: number;

  constructor(status: OrderStatus, user: User, totalPrice: number, orderDate?: Date) {
    this._status = status;
    this._user = user;
    this._orderDate = orderDate;
    this._totalPrice = totalPrice;
  }


  get totalPrice(): number {
    return this._totalPrice;
  }

  set totalPrice(value: number) {
    this._totalPrice = value;
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

  get opinions(): Opinion[] {
    // @ts-ignore
    return this._opinions;
  }

  set opinions(value: Opinion[]) {
    this._opinions = value;
  }

  get id(): number {
    return this._id;
  }
}