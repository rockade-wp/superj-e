// ==================== src/components/forms/PenyerahanForm.tsx ====================
import { useState } from "react";
import { FormWrapper } from "./FormWrapper";
import { Input } from "../common/Input";

interface PenyerahanFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}

export function PenyerahanForm({
    initialData = {},
    onSave,
    canEdit = true,
}: PenyerahanFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nomor: initialData.nomor || "",
        tgl: initialData.tgl || "",
        uraian: initialData.uraian || "",
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
            title="Form 5: Surat Penyerahan Barang"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <Input
                label="Nomor Surat"
                required
                placeholder="027 / ... / DKISS / 2024"
                value={formData.nomor}
                onChange={(e) =>
                    setFormData({ ...formData, nomor: e.target.value })
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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uraian Pekerjaan <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="input-field min-h-[100px]"
                    required
                    value={formData.uraian}
                    onChange={(e) =>
                        setFormData({ ...formData, uraian: e.target.value })
                    }
                    disabled={!canEdit}
                />
            </div>
        </FormWrapper>
    );
}
