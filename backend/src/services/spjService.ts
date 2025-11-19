import { PrismaClient } from "../generated/prisma";
import { logActivity } from "./activityLogService";

const prisma = new PrismaClient();

export const createSpjSubmission = async (
    rupId: string,
    year: number,
    activityName: string,
    operatorId: string
) => {
    return prisma.$transaction(async (tx) => {
        // 1. Buat SPJ
        const submission = await tx.spjSubmission.create({
            data: {
                rupId,
                year,
                activityName,
                operatorId,
                status: "draft",
            },
        });

        // 2. Buat 11 form
        const forms = [];
        for (let formType = 1; formType <= 11; formType++) {
            forms.push(
                tx.spjForm.create({
                    data: {
                        spjId: submission.id,
                        formType,
                        data: {},
                        status: "filled",
                    },
                })
            );
        }
        await Promise.all(forms);

        // 3. Log activity — gunakan TX, bukan prisma global!
        await tx.activityLog.create({
            data: {
                spjId: submission.id,
                userId: operatorId,
                action: "submit",
            },
        });

        return submission;
    });
};

export const updateSpjForm = async (
    spjId: string,
    formType: number,
    formData: any, // ini adalah objek JSON yang dikirim dari frontend
    operatorId: string
) => {
    // Pastikan SPJ milik operator ini
    const spj = await prisma.spjSubmission.findFirst({
        where: { id: spjId, operatorId },
    });
    if (!spj) throw new Error("SPJ not found or access denied");

    // Update form
    return prisma.spjForm.updateMany({
        where: { spjId, formType },
        data: {
            data: formData,
            status: "filled",
        },
    });
};

export const uploadScan = async (
    spjId: string,
    formType: number,
    filePath: string,
    operatorId: string
) => {
    // Pastikan SPJ milik operator ini
    const spj = await prisma.spjSubmission.findFirst({
        where: { id: spjId, operatorId },
    });
    if (!spj) throw new Error("SPJ not found or access denied");

    // Update hanya kolom physicalSignatureScanUrl
    return prisma.spjForm.updateMany({
        where: { spjId, formType },
        data: {
            physicalSignatureScanUrl: filePath,
        },
    });
};

export const signSpjForm = async (
    spjId: string,
    formType: number,
    signerId: string,
    notes?: string
) => {
    const form = await prisma.spjForm.findFirst({
        where: { spjId, formType },
    });
    if (!form) throw new Error("Form not found");

    // Tentukan status berdasarkan keberadaan notes
    const status = notes ? "rejected" : "signed";

    // Update form
    await prisma.spjForm.update({
        where: { id: form.id },
        data: { status, notes: notes || null },
    });

    // Jika tidak ditolak, simpan log TTE
    if (!notes) {
        await prisma.signatureLog.create({
            data: {
                formId: form.id,
                signerId,
                tteMetadata: "Simulated TTE metadata", // nanti ganti dengan integrasi PSE
            },
        });
    }
    const action = notes ? `reject_form_${formType}` : `sign_form_${formType}`;
    await logActivity(spjId, signerId, action);

    return { status, notes };
};
