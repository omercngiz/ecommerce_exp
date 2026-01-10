import ProductModel from '../models/product.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from "../database/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database();
const productModel = new ProductModel();

const PRODUCT_DATABASE = join(__dirname, '../database/data/product.data.json');

export default class ProductService {
    async createProduct(product) {
        const createdProduct = productModel.create(product);
        return await db.write(PRODUCT_DATABASE, createdProduct);
    }

    async getProducts() {
        return await db.read(PRODUCT_DATABASE);
    }

    async getProductById(id) {
        const products = await db.read(PRODUCT_DATABASE);
        return products.find(product => product.id === id);
    }

    async deleteProducts(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return { status: 400, message: 'ids must be a non-empty array' };
        }

        // IDs array'ini Set'e çevir (hızlı lookup için)
        const idsToDelete = new Set(ids);
        const results = [];

        // Her ID için silme işlemi yap
        for (const id of ids) {
            const result = await db.remove(PRODUCT_DATABASE, id);
            results.push({ id, result });
        }

        return {
            status: 200,
            message: `Attempted to delete ${ids.length} products`,
            results
        };
    }

    async deleteProductById(id) {
        return await db.remove(PRODUCT_DATABASE, id);
    }

}