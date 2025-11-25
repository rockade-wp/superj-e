// ==================== src/components/forms/PermohonanForm.tsx ====================
import { useState } from "react";
import { FormWrapper } from "./FormWrapper";
import { Input } from "../common/Input";

interface PermohonanFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}

export function PermohonanForm({
    initialData = {},
    onSave,
    canEdit = true,
}: PermohonanFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_pekerjaan: initialData.nama_pekerjaan || "",
        nilai: initialData.nilai || 0,
        masa_pelaksanaan: initialData.masa_pelaksanaan || "",
        nomor_spb: initialData.nomor_spb || "",
        tgl_spb: initialData.tgl_spb || "",
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
            title="Form 4: Surat Permohonan Serah Terima Barang"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <Input
                label="Nama Pekerjaan"
                required
                value={formData.nama_pekerjaan}
                onChange={(e) =>
                    setFormData({ ...formData, nama_pekerjaan: e.target.value })
                }
                disabled={!canEdit}
            />

            <Input
                label="Nilai"
                type="number"
                required
                value={formData.nilai}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        nilai: parseFloat(e.target.value) || 0,
                    })
                }
                disabled={!canEdit}
            />

            <Input
                label="Masa Pelaksanaan"
                required
                placeholder="11 Juli s.d 15 Juli 2024"
                value={formData.masa_pelaksanaan}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        masa_pelaksanaan: e.target.value,
                    })
                }
                disabled={!canEdit}
            />

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
                label="Tanggal SPB"
                type="date"
                required
                value={formData.tgl_spb}
                onChange={(e) =>
                    setFormData({ ...formData, tgl_spb: e.target.value })
                }
                disabled={!canEdit}
            />
        </FormWrapper>
    );
}
