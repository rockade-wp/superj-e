import { Router } from "express";
import multer from "multer";
import path from "path";
import prisma from "../prisma";
import {
    createSpjSubmission,
    updateSpjForm,
    uploadScan,
    signSpjForm,
    getDraftForm,
} from "../services/spjService";
import {
    submitVerification,
    finalizeSpj,
} from "../services/verificationService";
import { logActivity } from "../services/activityLogService";
import { generateSpjPDF, generateSingleFormPDF } from "../utils/pdfGenerator";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

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

// 1. Create new SPJ submission
router.post(
    "/",
    authenticateToken,
    authorizeRole("OPERATOR"),
    async (req, res) => {
        try {
            const { rupId, year, activityName, activity } = req.body;

            if (!rupId || !year || !activityName || !activity) {
                return res.status(400).json({
                    error: "rupId, year, activityName, dan activity wajib diisi",
                });
            }

            const submission = await createSpjSubmission(
                rupId,
                parseInt(year),
                activityName,
                activity,
                req.user!.id
            );
            res.status(201).json(submission);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

// 2. Get all SPJ submissions (filtered by role)
router.get("/", authenticateToken, async (req, res) => {
    try {
        let spjSubmissions;

        if (req.user?.role === "OPERATOR") {
            spjSubmissions = await prisma.spjSubmission.findMany({
                where: { operatorId: req.user.id },
                include: {
                    forms: {
                        orderBy: { formType: "asc" },
                    },
                    operator: {
                        select: { name: true, email: true, role: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        } else {
            spjSubmissions = await prisma.spjSubmission.findMany({
                include: {
                    forms: {
                        orderBy: { formType: "asc" },
                    },
                    operator: {
                        select: { name: true, email: true, role: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        res.json(spjSubmissions);
    } catch (error: any) {
        res.status(500).json({ error: "Gagal mengambil data SPJ" });
    }
});

// 3. Get activity logs (PA only)
router.get(
    "/logs",
    authenticateToken,
    authorizeRole("PA"),
    async (req, res) => {
        try {
            const logs = await prisma.activityLog.findMany({
                include: {
                    user: { select: { name: true, role: true } },
                    spj: { select: { rupId: true, activityName: true } },
                },
                orderBy: { timestamp: "desc" },
            });
            res.json(logs);
        } catch (error: any) {
            res.status(500).json({ error: "Gagal mengambil log aktivitas" });
        }
    }
);

// 4. Get single SPJ detail
router.get("/:spjId", authenticateToken, async (req, res) => {
    try {
        const { spjId } = req.params;
        const spj = await prisma.spjSubmission.findUnique({
            where: { id: spjId },
            include: {
                forms: {
                    orderBy: { formType: "asc" },
                    include: {
                        signatures: {
                            include: {
                                signer: {
                                    select: {
                                        name: true,
                                        role: true,
                                        nip: true,
                                    },
                                },
                            },
                        },
                    },
                },
                operator: {
                    select: { name: true, email: true, nip: true, role: true },
                },
                verification: {
                    include: {
                        validator: {
                            select: { name: true, nip: true, role: true },
                        },
                        verifier: {
                            select: { name: true, nip: true, role: true },
                        },
                    },
                },
            },
        });

        if (!spj) {
            return res.status(404).json({ error: "SPJ tidak ditemukan" });
        }

        // Validasi akses untuk OPERATOR
        if (req.user?.role === "OPERATOR" && spj.operatorId !== req.user.id) {
            return res
                .status(403)
                .json({ error: "Anda tidak berwenang melihat SPJ ini" });
        }

        res.json(spj);
    } catch (error: any) {
        res.status(500).json({ error: "Gagal mengambil detail SPJ" });
    }
});

// 5. Update form data
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

            res.json({ message: "Form berhasil diperbarui" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

// 6. Download draft form (Form 1, 2, 3 only)
router.get(
    "/:spjId/form/:formType/download-draft",
    authenticateToken,
    authorizeRole("OPERATOR"),
    async (req, res) => {
        try {
            const { spjId, formType } = req.params;
            const formTypeInt = parseInt(formType);

            if (formTypeInt < 1 || formTypeInt > 3) {
                return res.status(400).json({
                    error: "Hanya Form 1, 2, dan 3 yang dapat diunduh sebagai draft.",
                });
            }

            const { formData, spjMetadata } = await getDraftForm(
                spjId,
                formTypeInt
            );

            const pdfBuffer = await generateSingleFormPDF(
                formTypeInt,
                formData,
                spjMetadata
            );

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=DRAFT_${getFormName(formTypeInt)}_${
                    spjMetadata.rupId
                }.pdf`
            );
            res.send(pdfBuffer);

            await logActivity(
                spjId,
                req.user!.id,
                `download_draft_form_${formType}`
            );
        } catch (error: any) {
            console.error("Draft download error:", error);
            res.status(400).json({ error: error.message });
        }
    }
);

// 7. Upload physical signature scan
router.post(
    "/:spjId/form/:formType/upload",
    authenticateToken,
    authorizeRole("OPERATOR"),
    upload.single("scan"),
    async (req, res) => {
        try {
            const { spjId, formType } = req.params;
            const { fileType } = req.body;
            const filePath = req.file ? `/uploads/${req.file.filename}` : null;

            if (!filePath) {
                return res.status(400).json({ error: "File tidak ditemukan" });
            }

            if (fileType !== "pdf" && fileType !== "excel") {
                return res.status(400).json({
                    error: "Tipe file harus 'pdf' atau 'excel'",
                });
            }

            await uploadScan(
                spjId,
                parseInt(formType),
                filePath,
                req.user!.id,
                fileType as "pdf" | "excel"
            );

            await logActivity(
                spjId,
                req.user!.id,
                `upload_physical_scan_form_${formType}`
            );

            res.json({
                message: "Scan fisik berhasil diunggah",
                path: filePath,
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            res.status(400).json({ error: error.message });
        }
    }
);

// 8. Sign form with TTE
router.post(
    "/:spjId/form/:formType/sign",
    authenticateToken,
    async (req, res) => {
        try {
            const { spjId, formType } = req.params;
            const { notes } = req.body;
            const signerId = req.user!.id;
            const signerRole = req.user!.role;

            // Validasi role sesuai form
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

// 9. Submit verification (Pengurus Barang)
router.post(
    "/:spjId/verify",
    authenticateToken,
    authorizeRole("PENGURUS_BARANG"),
    async (req, res) => {
        try {
            const { spjId } = req.params;
            const { isValid, notes } = req.body;

            if (typeof isValid !== "boolean") {
                return res.status(400).json({
                    error: "isValid harus berupa boolean (true/false)",
                });
            }

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

// 10. Finalize SPJ (PPK Keuangan)
router.post(
    "/:spjId/finalize",
    authenticateToken,
    authorizeRole("PPK_KEUANGAN"),
    async (req, res) => {
        try {
            const { spjId } = req.params;
            const { isFinalValid, notes } = req.body;

            if (typeof isFinalValid !== "boolean") {
                return res.status(400).json({
                    error: "isFinalValid harus berupa boolean (true/false)",
                });
            }

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

// 11. Download complete SPJ PDF
router.get("/:spjId/download", authenticateToken, async (req, res) => {
    try {
        const { spjId } = req.params;
        const spj = await prisma.spjSubmission.findUnique({
            where: { id: spjId },
            include: {
                forms: true,
                verification: {
                    include: { validator: true, verifier: true },
                },
                operator: true,
            },
        });

        if (!spj) {
            return res.status(404).json({ error: "SPJ tidak ditemukan" });
        }

        if (spj.status !== "completed") {
            return res.status(400).json({
                error: "SPJ belum selesai, tidak dapat diunduh",
            });
        }

        const spjForPDF = {
            ...spj,
            forms: spj.forms.map((form: any) => ({
                ...form,
                formType: String(form.formType),
            })),
        };

        const pdfBuffer = await generateSpjPDF(spjForPDF);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=SPJ_${spj.rupId}_${spj.year}.pdf`
        );
        res.send(pdfBuffer);

        await logActivity(spjId, req.user!.id, "download_complete_spj");
    } catch (error: any) {
        console.error("PDF generation error:", error);
        res.status(500).json({ error: "Gagal membuat berkas PDF" });
    }
});

// Helper function
function getValidRolesForForm(formType: number): string[] {
    switch (formType) {
        case 1:
            return ["PPK"];
        case 2:
            return ["PPK"];
        case 3:
            return ["PA"];
        case 4:
            return ["OPERATOR"];
        case 5:
            return ["PPK"];
        case 6:
            return ["PPTK"];
        case 7:
            return ["PA"];
        case 8:
            return ["PENGURUS_BARANG"];
        case 9:
            return ["PPTK"];
        case 10:
            return ["PENGURUS_BARANG"];
        case 11:
            return ["PPK_KEUANGAN"];
        default:
            return [];
    }
}

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
        "Lembar_Verifikasi",
    ];
    return names[formType] || `Form_${formType}`;
}

export default router;
