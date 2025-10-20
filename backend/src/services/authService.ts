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

  // Jangan kembalikan passwordHash!
  const { passwordHash, ...safeUser } = user;
  return { token, user: safeUser };
};
