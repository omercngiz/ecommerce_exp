import express from "express";

import User from "./user.js";
import Category from "./category.js";
import Product from "./product.js";
import Database from "./database.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

const db = new Database();

const omer = new User("Omer", "Kara", "omerkara", "omerkara@gmail.com", "hashed_password");
const ali = new User("Ali", "Veli", "aliveli", "aliveli@gmail.com", "hashed_password");
const kerem = new User("Kerem", "Demir", "keremdemir", "keremdemir@gmail.com", "hashed_password");

let users = [omer, ali, kerem];
db.saveUser(users);

const laptop = new Product("Laptop", "A high performance laptop", 1500, 10);
const smartphone = new Product("Smartphone", "A latest model smartphone", 800, 25);
const headphones = new Product("Headphones", "Noise cancelling headphones", 200, 50);

let products = [laptop, smartphone, headphones];
db.saveProduct(products);

const electronics = new Category("Electronics", "Electronic devices and gadgets");
const appliances = new Category("Appliances", "Home and kitchen appliances");

let categories = [electronics, appliances];
db.saveCategory(categories);

electronics.addProduct(laptop);
electronics.addProduct(smartphone);

headphones.addCategory(electronics);

omer.addToBasket(laptop, 1);
ali.addToBasket(smartphone, 2);

app.get("/users", (req, res) => {
  res.send(db.loadUser());
});

app.listen(3000, () => {
  console.log("E-commerce API is running on http://localhost:3000");
});