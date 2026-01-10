import express from "express";
import { Router } from "express";

const router =  Router();

router.get("/categories/all", (req, res) => {
    res.send();
});

export default router;