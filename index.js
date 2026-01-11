import express from "express";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import userRouter from "./src/routes/user-routes.js";
import categoryRouter from "./src/routes/category-routes.js";
import productRouter from "./src/routes/product-routes.js";
import webRouter from "./src/routes/web-routes.js";
import authRouter from "./src/routes/auth-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// View engine setup
app.set('views', join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(express.json());

app.use("/", authRouter);                 // auth routes
app.use("/", webRouter);                  // UI routes
app.use("/api/user", userRouter);         // user API routes
app.use("/api/category", categoryRouter); // category API routes
app.use("/api/product", productRouter);   // product API routes

const server = app.listen(3000, () => {
  console.log("E-commerce API is running on http://localhost:3000");
});
