import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import bcrypt from "bcrypt";
import {User} from "./User";
import {Opinion} from "./Opinion";

@Entity("Accounts")
export class Account {
    @PrimaryGeneratedColumn()
    _id!: number;

    @Column({ unique: true, type: "varchar" })
    _username: string;

    @Column("varchar")
    _password: string;

    @Column({ type: "varchar" })
    _accountType: string;


    @OneToMany(() => User, (user) => user.account)
    private _users!: User[];

    constructor(username: string, password: string, accountType: "CLIENT" | "MANAGER") {
        this._username = username;
        this._password = password;
        this._accountType = accountType;

    }

    get users(): User[] {
        return this._users;
    }

    set users(value: User[]) {
        this._users = value;
    }

    async hashPassword() {
        this._password = await bcrypt.hash(this._password, 10);
    }

    async validatePassword(plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, this._password);
    }
}
