// ==================== src/components/forms/SpbForm.tsx ====================
import { useState, useEffect } from "react";
import { FormWrapper } from "./FormWrapper";
import { ItemsTable } from "./ItemsTable";
import { Input } from "../common/Input";
import type { FormItem } from "../../types";

interface SpbFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}

export function SpbForm({
    initialData = {},
    onSave,
    canEdit = true,
}: SpbFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nomor_spb: initialData.nomor_spb || "",
        id_rup: initialData.id_rup || "",
        rekanan: initialData.rekanan || "",
        alamat_rekanan: initialData.alamat_rekanan || "",
        pekerjaan: initialData.pekerjaan || "",
        instansi:
            initialData.instansi ||
            "Dinas Komunikasi Informatika Statistik dan Persandian Kab. Sumbawa",
        items: initialData.items || [],
        tgl_mulai: initialData.tgl_mulai || "",
        tgl_selesai: initialData.tgl_selesai || "",
        nilai: initialData.nilai || 0,
        nilai_terbilang: initialData.nilai_terbilang || "",
        tgl_ttd: initialData.tgl_ttd || "",
        ppk_nama: initialData.ppk_nama || "",
        ppk_nip: initialData.ppk_nip || "",
    });

    // Auto-calculate nilai from items
    useEffect(() => {
        const total = formData.items.reduce(
            (sum: number, item: FormItem) => sum + item.total,
            0
        );
        setFormData((prev) => ({ ...prev, nilai: total }));
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
            title="Form 1: Surat Pesanan Barang (SPB)"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Nomor SPB"
                    required
                    value={formData.nomor_spb}
                    onChange={(e) =>
                        setFormData({ ...formData, nomor_spb: e.target.value })
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
                label="Nama Rekanan"
                required
                value={formData.rekanan}
                onChange={(e) =>
                    setFormData({ ...formData, rekanan: e.target.value })
                }
                disabled={!canEdit}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Rekanan <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="input-field min-h-[80px]"
                    required
                    value={formData.alamat_rekanan}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            alamat_rekanan: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
            </div>

            <Input
                label="Pekerjaan"
                required
                value={formData.pekerjaan}
                onChange={(e) =>
                    setFormData({ ...formData, pekerjaan: e.target.value })
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Tanggal Mulai"
                    type="date"
                    required
                    value={formData.tgl_mulai}
                    onChange={(e) =>
                        setFormData({ ...formData, tgl_mulai: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="Tanggal Selesai"
                    type="date"
                    required
                    value={formData.tgl_selesai}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            tgl_selesai: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
            </div>

            <Input
                label="Nilai Terbilang"
                required
                placeholder="Seratus juta rupiah"
                value={formData.nilai_terbilang}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        nilai_terbilang: e.target.value,
                    })
                }
                disabled={!canEdit}
            />

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

            <Input
                label="Tanggal Tanda Tangan"
                type="date"
                required
                value={formData.tgl_ttd}
                onChange={(e) =>
                    setFormData({ ...formData, tgl_ttd: e.target.value })
                }
                disabled={!canEdit}
            />
        </FormWrapper>
    );
}
