import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";


@Entity("Products")
export class User {
    @PrimaryGeneratedColumn()
    private _id!: number;

    @Column("varchar")
    private _userName: string;

    @Column("varchar")
    private _email: string;

    @Column("varchar")
    private _phone: string;

    constructor(userName: string, email: string, phone: string) {
        this._userName = userName;
        this._email = email;
        this._phone = phone;
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