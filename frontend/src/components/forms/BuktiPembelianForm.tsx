// ==================== src/components/forms/BuktiPembelianForm.tsx ====================
import { useState, useEffect } from "react";
import { FormWrapper } from "./FormWrapper";
import { ItemsTable } from "./ItemsTable";
import { Input } from "../common/Input";
import type { FormItem } from "../../types";

interface BuktiPembelianFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}

export function BuktiPembelianForm({
    initialData = {},
    onSave,
    canEdit = true,
}: BuktiPembelianFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        rekanan: initialData.rekanan || "",
        id_rup: initialData.id_rup || "",
        tahun_anggaran: initialData.tahun_anggaran || new Date().getFullYear(),
        items: initialData.items || [],
        total: initialData.total || 0,
    });

    // Auto-calculate total from items
    useEffect(() => {
        const total = formData.items.reduce(
            (sum: number, item: FormItem) => sum + item.total,
            0
        );
        setFormData((prev) => ({ ...prev, total }));
    }, [formData.items]);

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
            title="Form 2: Bukti Pembelian"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Nama Rekanan"
                    required
                    value={formData.rekanan}
                    onChange={(e) =>
                        setFormData({ ...formData, rekanan: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="ID RUP"
                    required
                    value={formData.id_rup}
                    onChange={(e) =>
                        setFormData({ ...formData, id_rup: e.target.value })
                    }
                    disabled={!canEdit}
                />
            </div>

            <Input
                label="Tahun Anggaran"
                type="number"
                required
                min={2020}
                max={2100}
                value={formData.tahun_anggaran}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        tahun_anggaran: parseInt(e.target.value),
                    })
                }
                disabled={!canEdit}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rincian Barang <span className="text-red-500">*</span>
                </label>
                <ItemsTable
                    items={formData.items}
                    onChange={(items) => setFormData({ ...formData, items })}
                    canEdit={canEdit}
                />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900">
                    Total: Rp {formData.total.toLocaleString("id-ID")}
                </p>
            </div>
        </FormWrapper>
    );
}
