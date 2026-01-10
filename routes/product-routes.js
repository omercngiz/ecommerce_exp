import express from "express";
import { Router } from "express";

const router =  Router();

router.get("/products/all", (req, res) => {
    res.send();
});

export default router;