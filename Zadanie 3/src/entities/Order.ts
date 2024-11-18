import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import {OrderStatus} from "./OrderStatus"
import {Product} from "./Product"
import {ProductItem} from "./ProductItem";


@Entity("Orders")
export class Order {
  @PrimaryGeneratedColumn()
  private _id!: number;

  @Column("timestamp")
  private _orderDate?: Date;

  @Column("varchar")
  private _userName: string;

  @Column("varchar")
  private _email: string;

  @Column("varchar")
  private _phone: string;

  @ManyToOne(() => OrderStatus, { eager: true })
  private _status: OrderStatus;

  @OneToMany(() => ProductItem, (item: ProductItem) => item.order, { cascade: true })
  private _productList!: ProductItem[];

  constructor(status: OrderStatus, userName: string, email: string, phone: string, orderDate?: Date) {
    this._status = status;
    this._userName = userName;
    this._email = email;
    this._phone = phone;
    this._orderDate = orderDate;
  }
    
  public addProduct(product: Product, quantity: number): void {
    if (quantity > 0) {
      let item = new ProductItem(product, quantity);
      item.order = this;
      this._productList.push(item);
    } else {
      throw new Error("Quantity must be a positive number.");
    }
  }
    
  public printOrderDetails(): void {
    this._productList.forEach(item => {
      console.log(`Product: ${item.product.name}, Quantity: ${item.quantity}`);
    });
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

  get userName(): string {
    return this._userName;
  }

  set userName(value: string) {
    this._userName = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
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