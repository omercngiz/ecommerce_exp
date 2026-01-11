import { Router } from "express";

import UserService from "../services/user-service.js";

const router =  Router();
const userService = new UserService();

router.get("/all", async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await userService.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post("/", async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.status(result.status || 201).json(result);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const result = await userService.deleteUserById(userId);
        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.delete("/", async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await userService.deleteUsers(ids);
        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({ error: 'Failed to delete users' });
    }
});

export default router;