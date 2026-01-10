import express from "express";

import User from "./models/user.js";
import Category from "./models/category.js";
import Product from "./models/product.js";
import Database from "./database/database.js";

import userRouter from "./routes/user-routes.js";
import categoryRouter from "./routes/category-routes.js";
import productRouter from "./routes/product-routes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

const db = new Database();

app.get("/user", userRouter);
app.get("/category", categoryRouter);
app.get("/product", productRouter);

app.listen(3000, () => {
  console.log("E-commerce API is running on http://localhost:3000");
});