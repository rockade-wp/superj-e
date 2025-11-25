// ==================== src/components/forms/index.tsx (FIXED) ====================
export { FormWrapper } from "./FormWrapper";
export { ItemsTable } from "./ItemsTable";
export { SpbForm } from "./SpbForm";
export { BuktiPembelianForm } from "./BuktiPembelianForm";
export { KwitansiForm } from "./KwitansiForm";
export { PermohonanForm } from "./PermohonanForm";
export { PenyerahanForm } from "./PenyerahanForm";
export { BASerahTerimaForm } from "./BASerahTerimaForm";

// Import all form components
import { SpbForm } from "./SpbForm";
import { BuktiPembelianForm } from "./BuktiPembelianForm";
import { KwitansiForm } from "./KwitansiForm";
import { PermohonanForm } from "./PermohonanForm";
import { PenyerahanForm } from "./PenyerahanForm";
import { BASerahTerimaForm } from "./BASerahTerimaForm";

// Untuk Form 7-11, buat komponen di sini
import { useState, useEffect } from "react";
import { FormWrapper } from "./FormWrapper";
import { ItemsTable } from "./ItemsTable";
import { Input } from "../common/Input";
import type { FormItem } from "../../types";

// FORM 7: Surat Perintah Pengeluaran
function SuratPerintahForm({
    initialData = {},
    onSave,
    canEdit = true,
}: {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        dari: initialData.dari || "Pengguna Anggaran",
        kepada: initialData.kepada || "Pengurus Barang",
        alamat: initialData.alamat || "Jalan Garuda No. 1 Sumbawa Besar",
        sub_kegiatan: initialData.sub_kegiatan || "",
        items: initialData.items || [],
        total: initialData.total || 0,
        tgl: initialData.tgl || "",
    });

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
            title="Form 7: Surat Perintah Pengeluaran/Penyaluran Barang"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <Input
                label="Dari"
                required
                value={formData.dari}
                onChange={(e) =>
                    setFormData({ ...formData, dari: e.target.value })
                }
                disabled={!canEdit}
            />
            <Input
                label="Kepada"
                required
                value={formData.kepada}
                onChange={(e) =>
                    setFormData({ ...formData, kepada: e.target.value })
                }
                disabled={!canEdit}
            />
            <Input
                label="Alamat"
                required
                value={formData.alamat}
                onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                }
                disabled={!canEdit}
            />
            <Input
                label="Sub Kegiatan"
                required
                value={formData.sub_kegiatan}
                onChange={(e) =>
                    setFormData({ ...formData, sub_kegiatan: e.target.value })
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

// FORM 8: BA Penerimaan Barang
function BAPenerimaanForm({
    initialData = {},
    onSave,
    canEdit = true,
}: {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        pa_nama: initialData.pa_nama || "",
        pa_nip: initialData.pa_nip || "",
        pengurus_nama: initialData.pengurus_nama || "",
        pengurus_nip: initialData.pengurus_nip || "",
        items: initialData.items || [],
        total: initialData.total || 0,
        tgl: initialData.tgl || "",
    });

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
            title="Form 8: Berita Acara Penerimaan Barang"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Nama PA"
                    required
                    value={formData.pa_nama}
                    onChange={(e) =>
                        setFormData({ ...formData, pa_nama: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="NIP PA"
                    required
                    value={formData.pa_nip}
                    onChange={(e) =>
                        setFormData({ ...formData, pa_nip: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="Nama Pengurus Barang"
                    required
                    value={formData.pengurus_nama}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            pengurus_nama: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="NIP Pengurus Barang"
                    required
                    value={formData.pengurus_nip}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            pengurus_nip: e.target.value,
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
        </FormWrapper>
    );
}

// FORM 9: BA Serah Terima PPTK
function BASerahTerimaPPTKForm({
    initialData = {},
    onSave,
    canEdit = true,
}: {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        pengurus_nama: initialData.pengurus_nama || "",
        pengurus_nip: initialData.pengurus_nip || "",
        pptk_nama: initialData.pptk_nama || "",
        pptk_nip: initialData.pptk_nip || "",
        items: initialData.items || [],
        total: initialData.total || 0,
        tgl: initialData.tgl || "",
    });

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
            title="Form 9: Berita Acara Serah Terima Barang (PPTK)"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Nama Pengurus Barang"
                    required
                    value={formData.pengurus_nama}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            pengurus_nama: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="NIP Pengurus Barang"
                    required
                    value={formData.pengurus_nip}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            pengurus_nip: e.target.value,
                        })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="Nama PPTK"
                    required
                    value={formData.pptk_nama}
                    onChange={(e) =>
                        setFormData({ ...formData, pptk_nama: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="NIP PPTK"
                    required
                    value={formData.pptk_nip}
                    onChange={(e) =>
                        setFormData({ ...formData, pptk_nip: e.target.value })
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
        </FormWrapper>
    );
}

// FORM 10: Surat Pernyataan
function SuratPernyataanForm({
    initialData = {},
    onSave,
    canEdit = true,
}: {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: initialData.nama || "",
        nip: initialData.nip || "",
        golongan: initialData.golongan || "",
        jabatan: initialData.jabatan || "",
        kode_sub_kegiatan: initialData.kode_sub_kegiatan || "",
        nama_sub_kegiatan: initialData.nama_sub_kegiatan || "",
        kode_belanja: initialData.kode_belanja || "",
        uraian_belanja: initialData.uraian_belanja || "",
        bentuk_kontrak: initialData.bentuk_kontrak || "SURAT PESANAN BARANG",
        rekanan: initialData.rekanan || "",
        nomor_spb: initialData.nomor_spb || "",
        tgl_spb: initialData.tgl_spb || "",
        tgl_perolehan: initialData.tgl_perolehan || "",
        nilai: initialData.nilai || 0,
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
            title="Form 10: Surat Pernyataan"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            canEdit={canEdit}
        >
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Nama"
                    required
                    value={formData.nama}
                    onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="NIP"
                    required
                    value={formData.nip}
                    onChange={(e) =>
                        setFormData({ ...formData, nip: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="Golongan"
                    required
                    value={formData.golongan}
                    onChange={(e) =>
                        setFormData({ ...formData, golongan: e.target.value })
                    }
                    disabled={!canEdit}
                />
                <Input
                    label="Jabatan"
                    required
                    value={formData.jabatan}
                    onChange={(e) =>
                        setFormData({ ...formData, jabatan: e.target.value })
                    }
                    disabled={!canEdit}
                />
            </div>
            <Input
                label="Kode Sub Kegiatan"
                required
                value={formData.kode_sub_kegiatan}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        kode_sub_kegiatan: e.target.value,
                    })
                }
                disabled={!canEdit}
            />
            <Input
                label="Nama Sub Kegiatan"
                required
                value={formData.nama_sub_kegiatan}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        nama_sub_kegiatan: e.target.value,
                    })
                }
                disabled={!canEdit}
            />
            <Input
                label="Kode Belanja"
                required
                value={formData.kode_belanja}
                onChange={(e) =>
                    setFormData({ ...formData, kode_belanja: e.target.value })
                }
                disabled={!canEdit}
            />
            <Input
                label="Uraian Belanja"
                required
                value={formData.uraian_belanja}
                onChange={(e) =>
                    setFormData({ ...formData, uraian_belanja: e.target.value })
                }
                disabled={!canEdit}
            />
            <Input
                label="Bentuk Kontrak"
                required
                value={formData.bentuk_kontrak}
                onChange={(e) =>
                    setFormData({ ...formData, bentuk_kontrak: e.target.value })
                }
                disabled={!canEdit}
            />
            <Input
                label="Rekanan"
                required
                value={formData.rekanan}
                onChange={(e) =>
                    setFormData({ ...formData, rekanan: e.target.value })
                }
                disabled={!canEdit}
            />
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <Input
                label="Tanggal Perolehan"
                type="date"
                required
                value={formData.tgl_perolehan}
                onChange={(e) =>
                    setFormData({ ...formData, tgl_perolehan: e.target.value })
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
        </FormWrapper>
    );
}

// FORM 11: Lembar Verifikasi (READ-ONLY)
function LembarVerifikasiForm({ initialData = {} }: { initialData?: any }) {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                    Form 11: Lembar Verifikasi
                </h3>
                <p className="text-sm text-green-700">
                    Form ini otomatis diisi oleh sistem saat proses verifikasi
                    dan finalisasi SPJ.
                </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Validator (Pengurus Barang)
                        </p>
                        <p className="text-gray-900">
                            {initialData.validator_nama || "-"}
                        </p>
                        <p className="text-sm text-gray-600">
                            NIP: {initialData.validator_nip || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Verifier (PPK Keuangan)
                        </p>
                        <p className="text-gray-900">
                            {initialData.verifier_nama || "-"}
                        </p>
                        <p className="text-sm text-gray-600">
                            NIP: {initialData.verifier_nip || "-"}
                        </p>
                    </div>
                </div>

                {initialData.notes_verifikasi && (
                    <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm font-medium text-yellow-900">
                            Catatan Verifikasi:
                        </p>
                        <p className="text-yellow-800">
                            {initialData.notes_verifikasi}
                        </p>
                    </div>
                )}

                {initialData.notes_finalisasi && (
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900">
                            Catatan Finalisasi:
                        </p>
                        <p className="text-blue-800">
                            {initialData.notes_finalisasi}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// FORM SELECTOR COMPONENT
export function FormSelector({
    formType,
    initialData,
    onSave,
    canEdit = true,
}: {
    formType: number;
    initialData: any;
    onSave: (data: any) => Promise<void>;
    canEdit?: boolean;
}) {
    const forms: Record<
        number,
        React.ComponentType<{
            initialData?: any;
            onSave: (data: any) => Promise<void>;
            canEdit?: boolean;
        }>
    > = {
        1: SpbForm,
        2: BuktiPembelianForm,
        3: KwitansiForm,
        4: PermohonanForm,
        5: PenyerahanForm,
        6: BASerahTerimaForm,
        7: SuratPerintahForm,
        8: BAPenerimaanForm,
        9: BASerahTerimaPPTKForm,
        10: SuratPernyataanForm,
        11: LembarVerifikasiForm,
    };

    const FormComponent = forms[formType];

    if (!FormComponent) {
        return (
            <div className="text-red-600">Form {formType} tidak ditemukan</div>
        );
    }

    return (
        <FormComponent
            initialData={initialData}
            onSave={onSave}
            canEdit={canEdit}
        />
    );
}
