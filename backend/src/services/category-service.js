import CategoryModel from '../models/category.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from "../database/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database();
const categoryModel = new CategoryModel();

const CATEGORY_DATABASE = join(__dirname, '../database/data/category.data.json');

export default class CategoryService {
    async createCategory(category) {
        const createdCategory = categoryModel.create(category);
        return await db.write(CATEGORY_DATABASE, createdCategory);
    }

    async getCategories() {
        return await db.read(CATEGORY_DATABASE);
    }

    async getCategoryById(id) {
        const categories = await db.read(CATEGORY_DATABASE);
        return categories.find(category => category.id === id);
    }

    updateCategory(id, category) {
        // todo: implement update logic
    }

    async deleteCategories(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return { status: 400, message: 'ids must be a non-empty array' };
        }

        // IDs array'ini Set'e çevir (hızlı lookup için)
        const idsToDelete = new Set(ids);
        const results = [];

        // Her ID için silme işlemi yap
        for (const id of ids) {
            const result = await db.remove(CATEGORY_DATABASE, id);
            results.push({ id, result });
        }

        return {
            status: 200,
            message: `Attempted to delete ${ids.length} categories`,
            results
        };
    }

    async deleteCategoryById(id) {
        return await db.remove(CATEGORY_DATABASE, id);
    }
}