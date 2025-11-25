// ==================== src/components/forms/BASerahTerimaForm.tsx ====================
import { useState, useEffect } from "react";
import { FormWrapper } from "./FormWrapper";
import { ItemsTable } from "./ItemsTable";
import { Input } from "../common/Input";
import type { FormItem } from "../../types";

interface BASerahTerimaFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}

export function BASerahTerimaForm({
    initialData = {},
    onSave,
    canEdit = true,
}: BASerahTerimaFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        ppk_nama: initialData.ppk_nama || "",
        ppk_nip: initialData.ppk_nip || "",
        rekanan_nama: initialData.rekanan_nama || "",
        rekanan_jabatan: initialData.rekanan_jabatan || "",
        items: initialData.items || [],
        total: initialData.total || 0,
        tgl: initialData.tgl || "",
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
            title="Form 6: Berita Acara Serah Terima Barang (PPK & Rekanan)"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Nama PPK"
                    required
                    value={formData.ppk_nama}
                    onChange={(e) =>
                        setFormData({ ...formData, ppk_nama: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="NIP PPK"
                    required
                    value={formData.ppk_nip}
                    onChange={(e) =>
                        setFormData({ ...formData, ppk_nip: e.target.value })
                    }
                    disabled={!canEdit}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Nama Rekanan"
                    required
                    value={formData.rekanan_nama}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            rekanan_nama: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="Jabatan Rekanan"
                    required
                    value={formData.rekanan_jabatan}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            rekanan_jabatan: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
            </div>

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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900">
                    Total: Rp {formData.total.toLocaleString("id-ID")}
                </p>
            </div>
        </FormWrapper>
    );
}
