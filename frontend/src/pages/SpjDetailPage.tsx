import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Tabs,
    Tab,
    Box,
    Button,
    TextField,
    Paper,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    getSpjDetail,
    updateSpjForm,
    signSpjForm,
    uploadScan,
    downloadSpjExcel,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

// --- Definisi tipe data (seharusnya ada di src/types/index.ts) ---
interface SpjForm {
    id: string;
    formType: number;
    data: Record<string, any>; // Data JSON untuk setiap form
    status: "filled" | "signed" | "rejected";
    notes?: string;
    physicalSignatureScanUrl?: string;
}

interface SpjSubmission {
    id: string;
    rupId: string;
    activityName: string;
    year: number;
    status: "draft" | "verified" | "rejected" | "completed";
    operator: { id: string; name: string };
    forms: SpjForm[];
}

// --- Fungsi helper untuk menentukan role yang bisa menandatangani ---
// Ini harus sama dengan yang ada di backend (spjRoutes.ts)
const getValidRolesForForm = (formType: number): string[] => {
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
            return ["PENGURUS_BARANG"]; // Lembar Verifikasi
        default:
            return [];
    }
};

const SpjDetailPage: React.FC = () => {
    const { id: spjId } = useParams<{ id: string }>();
    const [spj, setSpj] = useState<SpjSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState<
        Record<number, Record<string, any>>
    >({});
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!spjId) return;

        const fetchData = async () => {
            try {
                const response = await getSpjDetail(spjId);
                setSpj(response.data);
                // Inisialisasi formData untuk setiap form
                const initialFormData: Record<number, Record<string, any>> = {};
                response.data.forms.forEach((form: SpjForm) => {
                    initialFormData[form.formType] = form.data;
                });
                setFormData(initialFormData);
            } catch (err: any) {
                setError(
                    err.response?.data?.error || "Gagal mengambil detail SPJ"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [spjId]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormChange = (formType: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [formType]: {
                ...prev[formType],
                [field]: value,
            },
        }));
    };

    const handleSaveForm = async (formType: number) => {
        if (!spjId) return;
        try {
            await updateSpjForm(spjId, formType, formData[formType]);
            alert("Form berhasil disimpan!");
        } catch (err: any) {
            setError(err.response?.data?.error || "Gagal menyimpan form");
        }
    };

    const handleSign = async (formType: number) => {
        if (!spjId) return;
        try {
            await signSpjForm(spjId, formType);
            alert("Form berhasil ditandatangani!");
            // Refresh data SPJ
            const response = await getSpjDetail(spjId);
            setSpj(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Gagal menandatangani form");
        }
    };

    const handleDownload = async () => {
        if (!spjId) return;
        try {
            const response = await downloadSpjExcel(spjId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `SPJ_${spj?.rupId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            setError("Gagal mengunduh file");
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!spj) return <Typography>SPJ tidak ditemukan.</Typography>;

    const currentForm = spj.forms[activeTab];
    const canEdit = user?.role === "OPERATOR" && spj.operator?.id === user.id;
    const canSign =
        user && getValidRolesForForm(currentForm.formType).includes(user.role);
    const isFormSigned = currentForm.status === "signed";

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Detail SPJ: {spj.rupId} - {spj.activityName}
            </Typography>

            {spj.status === "completed" && user?.role === "OPERATOR" && (
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleDownload}
                    sx={{ mb: 2 }}
                >
                    Unduh Excel
                </Button>
            )}

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="SPJ Forms Tabs"
                >
                    {spj.forms.map((form) => (
                        <Tab
                            key={form.formType}
                            label={`Form ${form.formType}`}
                        />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">
                        Form {currentForm.formType}
                    </Typography>

                    {/* --- Contoh Render Form Dinamis --- */}
                    {/* Anda perlu membuat komponen form yang lebih baik untuk setiap jenis form */}
                    {/* Ini hanyalah contoh sederhana dengan TextField */}
                    {Object.keys(formData[currentForm.formType] || {}).map(
                        (key) => (
                            <TextField
                                key={key}
                                fullWidth
                                label={key.replace(/_/g, " ").toUpperCase()}
                                value={
                                    formData[currentForm.formType][key] || ""
                                }
                                onChange={(e) =>
                                    handleFormChange(
                                        currentForm.formType,
                                        key,
                                        e.target.value
                                    )
                                }
                                margin="normal"
                                disabled={!canEdit || isFormSigned}
                            />
                        )
                    )}

                    {/* Tombol Aksi untuk Operator */}
                    {canEdit && !isFormSigned && (
                        <Button
                            variant="contained"
                            onClick={() => handleSaveForm(currentForm.formType)}
                            sx={{ mt: 2 }}
                        >
                            Simpan Perubahan
                        </Button>
                    )}

                    {/* Tombol Aksi untuk Pejabat yang Berwenang */}
                    {canSign && !isFormSigned && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleSign(currentForm.formType)}
                            sx={{ mt: 2, ml: 1 }}
                        >
                            Tandatangani Form
                        </Button>
                    )}

                    {/* Tampilkan Status dan Notes */}
                    {isFormSigned && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Form ini telah ditandatangani.
                        </Alert>
                    )}
                    {currentForm.status === "rejected" && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            Form ini ditolak. Catatan: {currentForm.notes}
                        </Alert>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default SpjDetailPage;
