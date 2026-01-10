import { generateId } from "../utils.js";

export default class User {
  constructor(name, surname, username, email, passwordHash) {
    this.id;
    this.name = name;
    this.surname = surname;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.basket = [];
  }

  create(data) {
    return new User(data.name, data.surname, data.username, data.email, data.passwordHash, data.basket);
  }

  addToBasket(product, quantity) {
    this.basket.push({ product, quantity });
  }
}