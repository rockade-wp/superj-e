// src/services/spjService.ts
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const createSpjSubmission = async (
  rupId: string,
  year: number,
  activityName: string,
  operatorId: string
) => {
  return prisma.$transaction(async (tx) => {
    // Buat SPJ Submission
    const submission = await tx.spjSubmission.create({
      data: {
        rupId,
        year,
        activityName,
        operatorId,
        status: "draft",
      },
    });

    // Generate 11 form kosong
    const forms = [];
    for (let formType = 1; formType <= 11; formType++) {
      forms.push(
        tx.spjForm.create({
          data: {
            spjId: submission.id,
            formType,
            data: {}, // JSON kosong
            status: "filled",
          },
        })
      );
    }

    await Promise.all(forms);
    return submission;
  });
};

// Tambahkan fungsi ini di bawah createSpjSubmission
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
