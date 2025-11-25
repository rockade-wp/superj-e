import { PrismaClient } from "../generated/prisma";
import { logActivity } from "./activityLogService";

const prisma = new PrismaClient();

export const getDraftForm = async (spjId: string, formType: number) => {
    // First fetch the form data and its spjId (relation field isn't present as 'spj' on the model)
    const form = await prisma.spjForm.findFirst({
        where: { spjId, formType },
        select: {
            data: true,
            spjId: true,
        },
    });

    if (!form) {
        throw new Error(`Form ${formType} not found for SPJ ${spjId}`);
    }

    // Only allow download of forms 1, 2, and 3 for physical signature
    if (formType < 1 || formType > 3) {
        throw new Error(
            `Download for form ${formType} is not allowed for physical signature at this stage.`
        );
    }

    // Load SPJ submission metadata by spjId
    const spjMetadata = await prisma.spjSubmission.findUnique({
        where: { id: form.spjId },
        select: {
            rupId: true,
            year: true,
            activityName: true,
            activity: true, // Tambahkan ini
            status: true,
        },
    });

    if (!spjMetadata) {
        throw new Error(`SPJ submission ${form.spjId} not found`);
    }

    // The actual Excel generation logic will be called from the route handler
    // We only return the data needed for generation here
    return {
        formData: form.data,
        spjMetadata,
    };
};

export const createSpjSubmission = async (
    rupId: string,
    year: number,
    activityName: string,
    activity: string, // Tambahkan field 'activity'
    operatorId: string
) => {
    return prisma.$transaction(async (tx) => {
        // 1. Buat SPJ
        const submission = await tx.spjSubmission.create({
            data: {
                rupId,
                year,
                activityName,
                activity, // Simpan field 'activity'
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
    operatorId: string,
    fileType: "pdf" | "excel" // New parameter to track file type
) => {
    // Pastikan SPJ milik operator ini
    const spj = await prisma.spjSubmission.findFirst({
        where: { id: spjId, operatorId },
    });
    if (!spj) throw new Error("SPJ not found or access denied");

    // Update form with the path to the physically signed document (PDF/Excel)
    // and set a new status, e.g., 'physical_signed'
    return prisma.spjForm.updateMany({
        where: { spjId, formType },
        data: {
            physicalSignatureScanUrl: filePath,
            physicalSignatureFileType: fileType, // Save file type
            status: "physical_signed", // New status
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

    // NEW LOGIC: Check if the form has been physically signed (for forms 1, 2, 3)
    // if (formType >= 1 && formType <= 3 && form.status !== "physical_signed") {
    //     throw new Error(
    //         `Form ${formType} must be physically signed and uploaded before TTE.`
    //     );
    // }

    // Tentukan status berdasarkan keberadaan notes
    const status = notes ? "rejected" : "signed";

    // Update form
    await prisma.spjForm.update({
        where: { id: form.id },
        data: { status, notes: notes || null },
    });

    // Jika tidak ditolak, simpan log TTE
    if (!notes) {
        // --- TTE INTEGRATION LOGIC GOES HERE ---
        // For now, keep the simulated log
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
