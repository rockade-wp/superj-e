import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

//  * Fungsi untuk mencatat aktivitas ke database
//  * @param spjId ID SPJ yang terkait
//  * @param userId ID user yang melakukan aksi
//  * @param action Deskripsi aksi (contoh: "sign_form_3", "download")

export const logActivity = async (
    spjId: string,
    userId: string,
    action: string
) => {
    return prisma.activityLog.create({
        data: {
            spjId,
            userId,
            action,
        },
    });
};
