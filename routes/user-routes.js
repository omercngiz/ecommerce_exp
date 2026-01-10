import express from "express";
import { Router } from "express";

const router =  Router();

router.get("/users/all", (req, res) => {
    res.send();
});

router.get("/users/:id", (req, res) => {
    res.send();
});

export default router;