import { generateId } from "./utils.js";

export default class User {
  constructor(name, surname, username, email, passwordHash) {
    this.id = generateId();
    this.name = name;
    this.surname = surname;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.basket = [];
  }

  addToBasket(product, quantity) {
    this.basket.push({ product, quantity });
  }
}