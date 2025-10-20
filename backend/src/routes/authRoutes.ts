// src/routes/authRoutes.ts
import { Router } from "express";
import { login } from "../services/authService";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
