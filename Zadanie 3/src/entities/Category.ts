import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Product} from "./Product";


@Entity("Categories")
export class Category {
    @PrimaryGeneratedColumn()
    private _id!: number;

    @Column("varchar")
    private _name: string;

    @OneToMany(() => Product, (product) => product.category)
    private _products!: Product[];

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }


    get id(): number {
        return this._id;
    }


    set id(value: number) {
        this._id = value;
    }

    get products(): Product[] {
        return this._products;
    }

    set products(value: Product[]) {
        this._products = value;
    }
}