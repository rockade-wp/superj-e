// ==================== src/components/forms/KwitansiForm.tsx ====================
import { useState } from "react";
import { FormWrapper } from "./FormWrapper";
import { Input } from "../common/Input";

interface KwitansiFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}

export function KwitansiForm({
    initialData = {},
    onSave,
    canEdit = true,
}: KwitansiFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        penerima:
            initialData.penerima ||
            "Kepala Dinas Komunikasi Informatika Statistik dan Persandian Kab. Sumbawa",
        jumlah_terbilang: initialData.jumlah_terbilang || "",
        jumlah_angka: initialData.jumlah_angka || 0,
        keperluan: initialData.keperluan || "",
        id_rup: initialData.id_rup || "",
        tgl: initialData.tgl || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormWrapper
            title="Form 3: Kwitansi"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penerima <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="input-field min-h-[80px]"
                    required
                    value={formData.penerima}
                    onChange={(e) =>
                        setFormData({ ...formData, penerima: e.target.value })
                    }
                    disabled={!canEdit}
                />
            </div>

            <Input
                label="Jumlah (Angka)"
                type="number"
                required
                value={formData.jumlah_angka}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        jumlah_angka: parseFloat(e.target.value) || 0,
                    })
                }
                disabled={!canEdit}
            />

            <Input
                label="Jumlah Terbilang"
                required
                placeholder="Sepuluh Juta Rupiah"
                value={formData.jumlah_terbilang}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        jumlah_terbilang: e.target.value,
                    })
                }
                disabled={!canEdit}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keperluan <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="input-field min-h-[100px]"
                    required
                    placeholder="Belanja untuk..."
                    value={formData.keperluan}
                    onChange={(e) =>
                        setFormData({ ...formData, keperluan: e.target.value })
                    }
                    disabled={!canEdit}
                />
            </div>

            <Input
                label="ID RUP"
                required
                value={formData.id_rup}
                onChange={(e) =>
                    setFormData({ ...formData, id_rup: e.target.value })
                }
                disabled={!canEdit}
            />

            <Input
                label="Tanggal"
                type="date"
                required
                value={formData.tgl}
                onChange={(e) =>
                    setFormData({ ...formData, tgl: e.target.value })
                }
                disabled={!canEdit}
            />
        </FormWrapper>
    );
}
