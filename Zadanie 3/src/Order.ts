import {OrderStatus} from "./OrderStatus"
import {Product} from "./Product"

interface ProductItem {
    product: Product;
    quantity: number;
  }
  

export class Order {
  private orderDate: Date;
  private status: OrderStatus;
  private userName: string;
  private email: string;
  private phone: string;
  private productList: ProductItem[] = [];

  constructor(status: OrderStatus, userName: string, email: string, phone: string, orderDate: Date) {
    if(OrderStatus==null || userName==null || email==null || phone==null)
      return;
    this.status = status;
    this.userName = userName;
    this.email = email;
    this.phone = phone;
    this.orderDate = orderDate;
  }


    
    
  public addProduct(product: Product, quantity: number): void {
    if (quantity > 0) {
      this.productList.push({ product, quantity });
    } else {
      throw new Error("Quantity must be a positive number.");
    }
  }
    
  public getProductList(): ProductItem[] {
    return this.productList;
  }
    
  public printOrderDetails(): void {
    this.productList.forEach(item => {
      console.log(`Product: ${item.product.getName()}, Quantity: ${item.quantity}`);
    });
  }
    
}