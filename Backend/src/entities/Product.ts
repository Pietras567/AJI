import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Category } from './Category'


@Entity("Products")
export class Product {
    @PrimaryGeneratedColumn({name: 'id'})
    private _id!: number;

    @Column("varchar", {name: 'name'})
    private _name: string;

    @Column("varchar", {name: 'description'})
    private _description: string;

    @Column("decimal", {name: 'price', precision: 10, scale: 2})
    private _price: number;

    @Column("float", {name: 'weight'})
    private _weight: number;

    @ManyToOne(() => Category, {eager: true})
    @JoinColumn({name: 'categoryId'})
    private _category: Category;

    constructor(name: string, description: string, price: number, weight: number, category: Category) {
        this._name = name;
        this._description = description;
        this._price = price;
        this._weight = weight;
        this._category = category;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }

    get weight(): number {
        return this._weight;
    }

    set weight(value: number) {
        this._weight = value;
    }

    get category(): Category {
        return this._category;
    }

    set category(value: Category) {
        this._category = value;
    }

    get id(): number {
        return this._id;
    }
}
  