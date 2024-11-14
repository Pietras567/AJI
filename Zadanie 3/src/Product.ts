import { Category } from './Category'

export class Product {
    private name: string;
    private description: string;
    private price: number;
    private weight: number;
    private category: Category;

    constructor(name: string, description: string, price: number, weight: number, category: string) {
        this.name = name;
        this.description = description
        this.price = price;
        this.weight = weight;
        this.category = new Category(category);
    }
  
    public getName(): string {
      return this.name;
    }
  
    public getPrice(): number {
      return this.price;
    }

    public getWeight(): number {
        return this.weight;
    }
  
    public getCategory(): string {
        return this.category.getCategory();
    }
  }
  