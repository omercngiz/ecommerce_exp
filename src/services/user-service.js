import UserModel from "../models/user.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from "../database/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database();
const userModel = new UserModel();

const USER_DATABASE = join(__dirname, '../database/data/user.data.json');

export default class UserService {
    async createUser(user) {
        const createdUser = userModel.create(user);
        return await db.write(USER_DATABASE, createdUser);
    }

    async getUsers() {
        return await db.read(USER_DATABASE);
    }
    async getUserById(id) {
        const users = await db.read(USER_DATABASE);
        return users.find(user => user.id === id);
    }

    async deleteUsers(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return { status: 400, message: 'ids must be a non-empty array' };
        }

        // IDs array'ini Set'e çevir (hızlı lookup için)
        const idsToDelete = new Set(ids);
        const results = [];

        // Her ID için silme işlemi yap
        for (const id of ids) {
            const result = await db.remove(USER_DATABASE, id);
            results.push({ id, result });
        }

        return {
            status: 200,
            message: `Attempted to delete ${ids.length} users`,
            results
        };
    }

    async deleteUserById(id) {
        return await db.remove(USER_DATABASE, id);
    }
}
