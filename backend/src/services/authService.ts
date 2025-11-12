// src/services/authService.ts
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "superje_jwt_secret_2025",
        { expiresIn: "1h" }
    );

    const { passwordHash, ...safeUser } = user;
    return { token, user: safeUser };
};

export const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    nip: string
) => {
    // Jika role bukan salah satu dari enum, tolak
    const validRoles = [
        "ADMIN",
        "OPERATOR",
        "PPK",
        "PPTK",
        "PENGURUS_BARANG",
        "PPK_KEUANGAN",
        "PA",
    ];
    if (!validRoles.includes(role)) {
        throw new Error("Invalid role");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: role as any,
            nip,
        },
    });
};
