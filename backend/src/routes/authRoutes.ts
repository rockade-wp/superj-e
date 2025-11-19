// src/routes/authRoutes.ts
import { Router } from "express";
import { login, register } from "../services/authService";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import prisma from "../prisma";

const router = Router();

router.get(
    "/users",
    authenticateToken,
    authorizeRole("ADMIN"),
    async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    nip: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            });
            res.json(users);
        } catch (error: any) {
            res.status(500).json({ error: "Gagal mengambil data pengguna" });
        }
    }
);

// Login (semua role)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Register (hanya untuk admin yang sudah login)
router.post(
    "/register",
    authenticateToken,
    authorizeRole("ADMIN"),
    async (req, res) => {
        try {
            const { name, email, password, role, nip } = req.body;
            const user = await register(name, email, password, role, nip);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

export default router;
