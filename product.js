import { generateId } from "./utils.js";

export default class Product {
  constructor(name, description, price, stock) {
    this.id = generateId();
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.categories = [];
  }

  create(data) {
    return new Product(data.name, data.description, data.price, data.stock, data.categories);
  }

  addCategory(category) {
    this.categories.push(category);
    category.products.push(this);
  }
} 