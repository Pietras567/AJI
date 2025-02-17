import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne, ManyToOne} from "typeorm";
import {Account} from "./Account";
import {Order} from "./Order";


@Entity("Users")
export class User {
    @PrimaryGeneratedColumn({name: 'id'})
    private _id!: number;

    @Column("varchar", {name: 'userName'})
    private _userName: string;

    @Column("varchar", {name: 'email'})
    private _email: string;

    @Column("varchar", {name: 'phone'})
    private _phone: string;
    
    @OneToOne(() => Account, {onDelete: "CASCADE"})
    @JoinColumn({name: 'accountId'})
    private _account: Account;

    constructor(userName: string, email: string, phone: string, account : Account) {
        this._userName = userName;
        this._email = email;
        this._phone = phone;
        this._account = account;
    }

    get account(): Account {
        return this._account;
    }

    set account(value: Account) {
        this._account = value;
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

    get id(): number {
        return this._id;
    }
}