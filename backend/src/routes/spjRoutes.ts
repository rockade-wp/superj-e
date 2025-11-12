import { Router } from "express";
import multer from "multer";
import path from "path";
// import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";
import {
    createSpjSubmission,
    updateSpjForm,
    uploadScan,
    signSpjForm,
} from "../services/spjService";
import {
    submitVerification,
    finalizeSpj,
} from "../services/verificationService";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import archiver from "archiver";
import fs from "fs";

const router = Router();

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

const uploadsDir = path.resolve("uploads");

router.post(
    "/",
    authenticateToken,
    authorizeRole("OPERATOR"),
    async (req, res) => {
        try {
            const { rupId, year, activityName } = req.body;
            const submission = await createSpjSubmission(
                rupId,
                year,
                activityName,
                req.user!.id
            );
            res.status(201).json(submission);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

router.patch(
    "/:spjId/form/:formType",
    authenticateToken,
    authorizeRole("OPERATOR"),
    async (req, res) => {
        try {
            const { spjId, formType } = req.params;
            const formData = req.body;

            await updateSpjForm(
                spjId,
                parseInt(formType),
                formData,
                req.user!.id
            );

            res.json({ message: "Form updated successfully" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

router.post(
    "/:spjId/form/:formType/upload",
    authenticateToken,
    authorizeRole("OPERATOR"),
    upload.single("scan"),
    async (req, res) => {
        try {
            const { spjId, formType } = req.params;
            const filePath = req.file ? `/uploads/${req.file.filename}` : null;

            if (!filePath) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            // Simpan ke database
            await uploadScan(spjId, parseInt(formType), filePath, req.user!.id);

            res.json({ message: "Scan berhasil diunggah", path: filePath });
        } catch (error: any) {
            console.error("Upload error:", error);
            res.status(400).json({ error: error.message });
        }
    }
);

router.post(
    "/:spjId/form/:formType/sign",
    authenticateToken,
    // authorizeRole akan dicek manual berdasarkan formType
    async (req, res) => {
        try {
            const { spjId, formType } = req.params;
            const { notes } = req.body; // opsional
            const signerId = req.user!.id;
            const signerRole = req.user!.role;

            // Validasi: role pejabat sesuai formType
            const validRoles = getValidRolesForForm(parseInt(formType));
            if (!validRoles.includes(signerRole)) {
                return res.status(403).json({
                    error: "Anda tidak berwenang menandatangani form ini",
                });
            }

            const result = await signSpjForm(
                spjId,
                parseInt(formType),
                signerId,
                notes
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

function getValidRolesForForm(formType: number): string[] {
    switch (formType) {
        case 1:
            return ["PPK"]; // Surat Pesanan Barang
        case 2:
            return ["PPK"]; // Bukti Pembelian
        case 3:
            return ["PA"]; // Kwitansi
        case 4:
            return ["OPERATOR"]; // Permohonan Serah Terima (operator)
        case 5:
            return ["PPK"]; // Penyerahan Barang
        case 6:
            return ["PPTK"]; // BA Serah Terima (PPTK)
        case 7:
            return ["PA"]; // Surat Perintah Pengeluaran
        case 8:
            return ["PENGURUS_BARANG"]; // BA Penerimaan
        case 9:
            return ["PPTK"]; // BA Serah Terima (lagi)
        case 10:
            return ["PENGURUS_BARANG"]; // Surat Pernyataan
        case 11:
            return ["PENGURUS_BARANG"]; // Lembar Verifikasi
        default:
            return [];
    }
}

router.post(
    "/:spjId/verify",
    authenticateToken,
    authorizeRole("PENGURUS_BARANG"),
    async (req, res) => {
        try {
            const { spjId } = req.params;
            const { isValid, notes } = req.body;
            const result = await submitVerification(
                spjId,
                req.user!.id,
                isValid,
                notes
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

router.post(
    "/:spjId/finalize",
    authenticateToken,
    authorizeRole("PPK_KEUANGAN"),
    async (req, res) => {
        try {
            const { spjId } = req.params;
            const { isFinalValid, notes } = req.body;
            const result = await finalizeSpj(
                spjId,
                req.user!.id,
                isFinalValid,
                notes
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

router.get(
    "/:spjId/download",
    authenticateToken,
    authorizeRole("OPERATOR"),
    async (req, res) => {
        try {
            const { spjId } = req.params;
            const spj = await prisma.spjSubmission.findUnique({
                where: { id: spjId },
                include: {
                    forms: true,
                    verification: {
                        include: {
                            validator: true,
                            verifier: true,
                        },
                    },
                    operator: true,
                },
            });

            if (!spj || spj.status !== "completed") {
                return res
                    .status(404)
                    .json({ error: "SPJ tidak ditemukan atau belum selesai" });
            }

            // Buat file ZIP
            const zip = archiver("zip", { zlib: { level: 9 } });
            res.setHeader("Content-Type", "application/zip");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=SPJ_${spj.rupId}.zip`
            );
            zip.pipe(res);

            // Tambahkan semua form sebagai file teks
            for (const form of spj.forms) {
                let content = "";
                const fileName = `Form_${form.formType}_${getFormName(
                    form.formType
                )}.txt`;

                if (form.formType === 11 && spj.verification) {
                    // Form 11: ambil data dari VerificationSheet, bukan form.data
                    content = JSON.stringify(
                        {
                            validator: spj.verification.validator?.name,
                            validatorNip: spj.verification.validator?.nip,
                            verifier: spj.verification.verifier?.name,
                            verifierNip: spj.verification.verifier?.nip,
                            status: spj.verification.status,
                            notes: spj.verification.notes,
                            signedAt: spj.verification.signedAt,
                        },
                        null,
                        2
                    );
                } else {
                    // Form 1-10: ambil dari form.data
                    content =
                        JSON.stringify(form.data, null, 2) +
                        (form.physicalSignatureScanUrl
                            ? `\n\nScan URL: ${form.physicalSignatureScanUrl}`
                            : "");
                }

                zip.append(content, { name: fileName });
            }

            // Tambahkan Lembar Verifikasi
            if (spj.verification) {
                zip.append(JSON.stringify(spj.verification, null, 2), {
                    name: "Lembar_Verifikasi.txt",
                });
            }

            // Tambahkan file scan asli (jika ada)
            for (const form of spj.forms) {
                if (form.physicalSignatureScanUrl) {
                    const fileName = path.basename(
                        form.physicalSignatureScanUrl
                    );
                    const filePath = path.join(uploadsDir, fileName);

                    if (fs.existsSync(filePath)) {
                        // Gunakan ekstensi asli file
                        const ext = path.extname(fileName).toLowerCase();
                        const outputName = `Scan_Form_${form.formType}${ext}`;
                        zip.file(filePath, { name: outputName });
                    }
                }
            }

            await zip.finalize();
        } catch (error: any) {
            console.error("Download error:", error);
            res.status(500).json({ error: "Gagal membuat berkas unduhan" });
        }
    }
);

function getFormName(formType: number): string {
    const names = [
        "",
        "SPB",
        "Bukti_Pembelian",
        "Kwitansi",
        "Permohonan_Serah_Terima",
        "Penyerahan_Barang",
        "BA_Serah_Terima_1",
        "Surat_Perintah_Pengeluaran",
        "BA_Penerimaan",
        "BA_Serah_Terima_2",
        "Surat_Pernyataan",
    ];
    return names[formType] || `Form_${formType}`;
}

export default router;
