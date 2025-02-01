import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import bcrypt from "bcrypt";
import {User} from "./User";
import {Opinion} from "./Opinion";

@Entity("Accounts")
export class Account {
    @PrimaryGeneratedColumn()
    private _id!: number;

    @Column({ unique: true, type: "varchar" })
    private _username: string;

    @Column("varchar")
    private _password: string;

    @Column({ type: "varchar" })
    private _accountType: string;

    @OneToOne(() => User, (user) => user.account)
    @JoinColumn({name: '_user_id'})
    private _user!: User;

    constructor(username: string, password: string, accountType: "CLIENT" | "MANAGER") {
        this._username = username;
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


    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
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
