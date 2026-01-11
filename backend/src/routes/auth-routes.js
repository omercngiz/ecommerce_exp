import express from "express";

const router = express.Router();

// LOGIN - Aynı URL, farklı metodlar
router.get("/login", (req, res) => {
  // Sayfa render et
  res.render('login');
});

router.post("/login", async (req, res) => {
  // todo: Giriş işlemi (backend)
});

// REGISTER - Aynı URL, farklı metodlar
router.get("/register", (req, res) => {
  // Sayfa render et
  res.render('register');
});

router.post("/register", async (req, res) => {
    // todo: Kayıt işlemi (backend)
});

export default router;