import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { spjService } from "../../services/spjService"; // FIXED: Changed from "@/services/spjService"
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

export function CreateSpjPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        rupId: "",
        year: new Date().getFullYear(),
        activityName: "",
        activity: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.rupId.trim()) {
            newErrors.rupId = "RUP ID wajib diisi";
        }

        if (!formData.activityName.trim()) {
            newErrors.activityName = "Nama kegiatan wajib diisi";
        }

        if (!formData.activity.trim()) {
            newErrors.activity = "Sub kegiatan wajib diisi";
        }

        if (formData.year < 2020 || formData.year > 2100) {
            newErrors.year = "Tahun tidak valid";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Mohon lengkapi semua field yang wajib diisi");
            return;
        }

        setIsLoading(true);

        try {
            const result = await spjService.createSpj(formData);
            toast.success("SPJ berhasil dibuat!");
            navigate(`/operator/spj/${result.id}`);
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/operator/spj")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Buat SPJ Baru
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Isi informasi dasar pengajuan SPJ
                        </p>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="RUP ID"
                                required
                                placeholder="Contoh: RUP-2025-001"
                                value={formData.rupId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        rupId: e.target.value,
                                    })
                                }
                                error={errors.rupId}
                            />

                            <Input
                                label="Tahun Anggaran"
                                type="number"
                                required
                                min={2020}
                                max={2100}
                                value={formData.year}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        year: parseInt(e.target.value),
                                    })
                                }
                                error={errors.year}
                            />
                        </div>

                        <Input
                            label="Nama Kegiatan"
                            required
                            placeholder="Contoh: Pengadaan Peralatan Komputer"
                            value={formData.activityName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    activityName: e.target.value,
                                })
                            }
                            error={errors.activityName}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Kegiatan / Uraian{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="input-field min-h-[120px]"
                                required
                                placeholder="Contoh: Pengadaan laptop, printer, dan peripheral untuk kebutuhan operasional..."
                                value={formData.activity}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        activity: e.target.value,
                                    })
                                }
                            />
                            {errors.activity && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.activity}
                                </p>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">
                                Informasi
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>
                                    • Setelah SPJ dibuat, sistem akan otomatis
                                    menghasilkan 11 form
                                </li>
                                <li>
                                    • Anda dapat mengisi dan mengelola form
                                    secara bertahap
                                </li>
                                <li>
                                    • Form 1-3 dapat diunduh untuk tanda tangan
                                    fisik
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate("/operator/spj")}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                <Save className="w-4 h-4" />
                                Buat SPJ
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
