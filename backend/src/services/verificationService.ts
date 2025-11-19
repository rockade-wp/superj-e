import { PrismaClient } from "../generated/prisma";
import { logActivity } from "./activityLogService";

const prisma = new PrismaClient();

export const submitVerification = async (
    spjId: string,
    validatorId: string,
    isValid: boolean,
    notes?: string
) => {
    // Cek apakah validator adalah Pengurus Barang
    const validator = await prisma.user.findUnique({
        where: { id: validatorId },
    });
    if (validator?.role !== "PENGURUS_BARANG") {
        throw new Error(
            "Hanya Pengurus Barang yang dapat mengisi lembar verifikasi"
        );
    }

    // Cek apakah semua form sudah disetujui
    // Hanya periksa form 1–10
    const forms = await prisma.spjForm.findMany({
        where: { spjId, formType: { in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
    });
    const allSigned =
        forms.length === 10 && forms.every((form) => form.status === "signed");
    if (!allSigned) {
        throw new Error("Semua form harus ditandatangani sebelum verifikasi");
    }

    // Simpan lembar verifikasi
    await prisma.verificationSheet.upsert({
        where: { spjId },
        create: {
            spjId,
            validatorId,
            status: isValid ? "valid" : "invalid",
            notes: notes || null,
        },
        update: {
            validatorId,
            status: isValid ? "valid" : "invalid",
            notes: notes || null,
        },
    });

    // Update status SPJ
    await prisma.spjSubmission.update({
        where: { id: spjId },
        data: { status: isValid ? "verified" : "rejected" },
    });
    await logActivity(spjId, validatorId, "verify");

    return { status: isValid ? "valid" : "invalid", notes };
};

export const finalizeSpj = async (
    spjId: string,
    verifierId: string,
    isFinalValid: boolean,
    notes?: string
) => {
    const verifier = await prisma.user.findUnique({
        where: { id: verifierId },
    });
    if (verifier?.role !== "PPK_KEUANGAN") {
        throw new Error(
            "Hanya PPK Keuangan yang dapat melakukan verifikasi akhir"
        );
    }

    const spj = await prisma.spjSubmission.findUnique({ where: { id: spjId } });
    if (spj?.status !== "verified") {
        throw new Error("SPJ belum diverifikasi oleh Pengurus Barang");
    }

    // Update verifikasi akhir
    await prisma.verificationSheet.update({
        where: { spjId },
        data: { verifierId, signedAt: new Date() },
    });

    // Finalisasi status
    await prisma.spjSubmission.update({
        where: { id: spjId },
        data: { status: isFinalValid ? "completed" : "rejected" },
    });

    await logActivity(spjId, verifierId, "finalize");

    return { status: isFinalValid ? "completed" : "rejected" };
};
