export class Category {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public getCategory(): string {
        return this.name;
    }
}