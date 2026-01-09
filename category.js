import { generateId } from "./utils.js";

export default class Category {
  constructor(name, description) {
    this.id = generateId();
    this.name = name;
    this.description = description;
    this.products = [];
  }

  create(data) {
    return new Category(data.name, data.description, data.products);
  }

  addProduct(product) {
    this.products.push(product);
    product.categories.push(this);
  }
}