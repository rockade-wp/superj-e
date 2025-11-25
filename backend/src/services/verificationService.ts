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

    // Cek apakah semua form 1-10 sudah ditandatangani (status 'signed')
    const forms = await prisma.spjForm.findMany({
        where: { spjId, formType: { in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
    });
    const allSigned =
        forms.length === 10 && forms.every((form) => form.status === "signed");
    if (!allSigned) {
        throw new Error(
            "Semua form 1-10 harus ditandatangani sebelum verifikasi"
        );
    }

    // Update Form 11 (Lembar Verifikasi) dengan data verifikasi awal
    await prisma.spjForm.updateMany({
        where: { spjId, formType: 11 },
        data: {
            data: {
                validator_nama: validator.name,
                validator_nip: validator.nip,
                notes_verifikasi: notes || null,
                status_verifikasi: isValid ? "valid" : "invalid",
            },
            status: isValid ? "filled" : "rejected", // Status form 11 diisi
        },
    });

    // Simpan lembar verifikasi (VerificationSheet)
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

    // Update Form 11 (Lembar Verifikasi) dengan data finalisasi
    await prisma.spjForm.updateMany({
        where: { spjId, formType: 11 },
        data: {
            data: {
                verifier_nama: verifier.name,
                verifier_nip: verifier.nip,
                notes_finalisasi: notes || null,
                status_finalisasi: isFinalValid ? "completed" : "rejected",
            },
            status: isFinalValid ? "signed" : "rejected", // Status form 11 ditandatangani/final
        },
    });

    // Update verifikasi akhir (VerificationSheet)
    await prisma.verificationSheet.update({
        where: { spjId },
        data: {
            verifierId,
            finalNotes: notes || null,
            status: isFinalValid ? "completed" : "rejected",
            signedAt: new Date(),
        },
    });

    // Finalisasi status SPJ
    await prisma.spjSubmission.update({
        where: { id: spjId },
        data: { status: isFinalValid ? "completed" : "rejected" },
    });

    await logActivity(spjId, verifierId, "finalize");

    return { status: isFinalValid ? "completed" : "rejected" };
};
