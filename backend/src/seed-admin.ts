// src/seed-admin.ts
import { PrismaClient } from "./generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "ihsan@sumbawakab.go.id";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log("Admin sudah ada di database");
        return;
    }

    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
        data: {
            name: "Ihsan Maulana",
            email,
            passwordHash,
            role: "ADMIN",
            nip: "199001012015011001",
        },
    });

    console.log("Admin berhasil dibuat:");
    console.log(`   Nama: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
}

main()
    .catch((e) => {
        console.error("Gagal membuat admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
