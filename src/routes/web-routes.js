import express from "express";

const router = express.Router();

// Sadece sayfa render eden route'lar
router.get("/index", (req, res) => {
  res.render('index');
});

router.get("/home", (req, res) => {
  res.render('home');
});

router.get("/about", (req, res) => {
  res.render('about');
});

router.get("/contact", (req, res) => {
  res.render('contact');
});

router.get("/basket", (req, res) => {
  res.render('basket');
});

export default router;