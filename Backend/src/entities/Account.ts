import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import bcrypt from "bcrypt";
import {User} from "./User";
import {Opinion} from "./Opinion";

@Entity("Accounts")
export class Account {
    @PrimaryGeneratedColumn({name: "id"})
    private _id!: number;

    @Column({name: "userName", unique: true, type: "varchar"})
    private _userName: string;

    @Column({name: "password", type: "varchar"})
    private _password: string;

    @Column({name: "accountType", type: "varchar"})
    private _accountType: string;

    @OneToOne(() => User, (user) => user.account)
    private _user!: User;

    constructor(userName: string, password: string, accountType: "CLIENT" | "MANAGER") {
        this._userName = userName;
        this._password = password;
        this._accountType = accountType;

    }

    get user(): User {
        return this._user;
    }

    set user(value: User) {
        this._user = value;
    }

    async hashPassword() {
        this._password = await bcrypt.hash(this._password, 10);
    }

    async validatePassword(plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, this._password);
    }


    get userName(): string {
        return this._userName;
    }

    set userName(value: string) {
        this._userName = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get accountType(): string {
        return this._accountType;
    }

    set accountType(value: string) {
        this._accountType = value;
    }

    get id(): number {
        return this._id;
    }
}
