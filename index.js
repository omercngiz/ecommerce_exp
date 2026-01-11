import express from "express";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import userRouter from "./src/routes/user-routes.js";
import categoryRouter from "./src/routes/category-routes.js";
import productRouter from "./src/routes/product-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// View engine setup
app.set('views', join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(express.json());

app.get("/", (req, res) => {
  res.render('home');
});

app.get("/home", (req, res) => {
  res.render('home');
});

app.get("/about", (req, res) => {
  res.render('about');
});

app.get("/contact", (req, res) => {
  res.render('contact');
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);

const server = app.listen(3000, () => {
  console.log("E-commerce API is running on http://localhost:3000");
});
