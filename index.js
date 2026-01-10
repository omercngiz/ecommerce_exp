import express from "express";

import User from "./models/user.js";
import Category from "./models/category.js";
import Product from "./models/product.js";
import Database from "./database.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

const db = new Database();

app.get("/users/all", (req, res) => {
  res.send(db.loadUser());
});

app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = db.loadUser().find((u) => u.id === userId);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: "User not found" });
  }
});

app.get("/products/all", (req, res) => {
  res.send(db.loadProduct());
});

app.get("/categories/all", (req, res) => {
  res.send(db.loadCategory());
});

app.listen(3000, () => {
  console.log("E-commerce API is running on http://localhost:3000");
});