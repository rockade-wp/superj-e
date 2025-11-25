// src/routes/authRoutes.ts
import { Router } from "express";
import {
    login,
    register,
    adminUpdateUser,
    adminDeleteUser,
    userUpdatePassword,
} from "../services/authService";
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

// Admin Update User
router.patch(
    "/users/:userId",
    authenticateToken,
    authorizeRole("ADMIN"),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const { name, email, nip, role } = req.body;

            if (!name || !email || !nip || !role) {
                return res.status(400).json({
                    error: "Name, email, NIP, and Role are required.",
                });
            }

            const updatedUser = await adminUpdateUser(
                userId,
                name,
                email,
                nip,
                role
            );
            res.json({
                message: "User updated successfully by Admin",
                user: updatedUser,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Admin Delete User
router.delete(
    "/users/:userId",
    authenticateToken,
    authorizeRole("ADMIN"),
    async (req, res) => {
        try {
            const { userId } = req.params;
            await adminDeleteUser(userId);
            res.json({ message: "User deleted successfully by Admin" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

// User Self Update Password
router.patch("/update-password", authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ error: "Current and new passwords are required." });
        }

        const updatedUser = await userUpdatePassword(
            userId,
            currentPassword,
            newPassword
        );
        res.json({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
