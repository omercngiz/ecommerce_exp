import { Router } from "express";

import CategoryService from "../services/category-service.js";

const router = Router();
const categoryService = new CategoryService();

router.get("/all", async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const category = await categoryService.getCategoryById(categoryId);
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

router.post("/", async (req, res) => {
    try {
        const result = await categoryService.createCategory(req.body);
        res.status(result.status || 201).json(result);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const result = await categoryService.deleteCategoryById(categoryId);
        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

router.delete("/", async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await categoryService.deleteCategories(ids);
        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error deleting categories:', error);
        res.status(500).json({ error: 'Failed to delete categories' });
    }
});

export default router;