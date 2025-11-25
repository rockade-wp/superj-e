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

// Admin Update User (Name, Email, Role, NIP)
export const adminUpdateUser = async (
    userId: string,
    name: string,
    email: string,
    nip: string,
    role: string
) => {
    // Cek apakah email atau NIP sudah digunakan oleh user lain
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail && existingEmail.id !== userId) {
        throw new Error("Email already in use by another user.");
    }
    const existingNip = await prisma.user.findUnique({ where: { nip } });
    if (existingNip && existingNip.id !== userId) {
        throw new Error("NIP already in use by another user.");
    }

    // PERUBAHAN: Cek apakah role valid
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

    return prisma.user.update({
        where: { id: userId },
        data: {
            name,
            email,
            nip,
            role: role as any,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            nip: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

// Admin Delete User (Operator/Pejabat)
export const adminDeleteUser = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found.");
    }
    if (user.role === "ADMIN") {
        throw new Error("Cannot delete an ADMIN user.");
    }

    // Tambahkan logika untuk memastikan tidak ada SPJ aktif yang terkait
    // Untuk saat ini, kita asumsikan tidak ada foreign key constraint yang menghalangi
    // Jika ada, ini akan ditangani oleh Prisma (misalnya, onDelete: Cascade atau Restrict)
    // Berdasarkan schema.prisma, User punya relasi ke SpjSubmission, SignatureLog, VerificationSheet, ActivityLog.
    // Jika relasi ini tidak di-set CASCADE, maka penghapusan akan gagal jika ada data terkait.
    // Untuk amannya, kita hanya izinkan hapus user yang tidak punya SPJ atau log terkait.
    // Namun, untuk sistem ini, kita asumsikan relasi sudah dihandle (misalnya, operator yang dihapus tidak boleh punya SPJ aktif).
    // Untuk sementara, kita biarkan Prisma yang menangani error constraint.

    return prisma.user.delete({
        where: { id: userId },
    });
};

// User Self Update Password
export const userUpdatePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new Error("Invalid current password");

    const passwordHash = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
        where: { id: userId },
        data: {
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            nip: true,
            updatedAt: true,
        },
    });
};
