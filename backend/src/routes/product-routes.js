import { Router } from "express";

import ProductService from "../services/product-service.js";

const router = Router();
const productService = new ProductService();

router.get("/all", async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await productService.getProductById(productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

router.post("/", async (req, res) => {
    try {
        const result = await productService.createProduct(req.body);
        res.status(result.status || 201).json(result);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const result = await productService.deleteProductById(productId);
        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

router.delete("/", async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await productService.deleteProducts(ids);
        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error deleting products:', error);
        res.status(500).json({ error: 'Failed to delete products' });
    }
});

export default router;