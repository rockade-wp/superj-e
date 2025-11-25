// src/types/spj.ts

// --- Tipe Data Dasar ---

export type FormItem = {
    nama: string;
    volume: number;
    satuan: string;
    harga: number;
    total: number;
    // Tambahan untuk item yang lebih kompleks
    subItems?: FormItem[];
};

export type SpjSubmission = {
    id: string;
    rupId?: string;
    year?: number;
    activityName?: string;
    activity?: string;
    status?: string;
    operatorId?: string;
};

export type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    nip?: string | null;
};

export type VerificationSheet = {
    id?: string;
    spjId?: string | null;
    validatorId?: string | null;
    verifierId?: string | null;
    status?: string | null;
    notes?: string | null;
    finalNotes?: string | null;
    signedAt?: Date | null;
};

// --- Tipe Data untuk 11 Form SPJ ---

// 1. Surat Pesanan Barang (SPB)
export type SpbData = {
    nomor_spb: string;
    id_rup: string;
    rekanan: string;
    alamat_rekanan: string;
    pekerjaan: string;
    instansi: string;
    items: FormItem[];
    tgl_mulai: string;
    tgl_selesai: string;
    nilai: number;
    nilai_terbilang: string;
    tgl_ttd: string;
    ppk_nama: string;
    ppk_nip: string;
    pa_nama: string; // Tambahan dari analisis
    pa_nip: string; // Tambahan dari analisis
};

// 2. Bukti Pembelian
export type BuktiPembelianData = {
    sub_kegiatan: string;
    id_rup: string;
    tahun_anggaran: number;
    items: FormItem[];
    total: number;
    nilai_terbilang: string;
    tgl_ttd: string;
    ppk_nama: string;
    ppk_nip: string;
    rekanan_nama: string; // Tambahan dari analisis
    rekanan_jabatan: string; // Tambahan dari analisis
};

// 3. Kwitansi
export type KwitansiData = {
    penerima: string;
    nilai_terbilang: string;
    uraian: string;
    nilai: number;
    tgl_ttd: string;
    ppk_nama: string;
    ppk_nip: string;
    penerima_nama: string;
    penerima_jabatan: string;
    kode_rekening: string;
    id_rup: string;
    nomor_spb: string;
    tgl_spb: string;
    pa_nama: string; // Tambahan dari analisis
    pa_nip: string; // Tambahan dari analisis
    pptk_nama: string; // Tambahan dari analisis
    pptk_nip: string; // Tambahan dari analisis
    bendahara_nama: string; // Tambahan dari analisis
    bendahara_nip: string; // Tambahan dari analisis
};

// 4. Surat Permohonan Serah Terima Barang
export type PermohonanSerahTerimaData = {
    nomor_surat: string;
    tgl_surat: string;
    ppk_nama: string;
    ppk_nip: string;
    pa_nama: string;
    pa_nip: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 5. Surat Penyerahan Barang (dari PPK ke PA)
export type PenyerahanBarangData = {
    nomor_surat: string;
    tgl_surat: string;
    ppk_nama: string;
    ppk_nip: string;
    pa_nama: string;
    pa_nip: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 6. Berita Acara Serah Terima Barang (antara PPK dan Rekanan)
export type BASerahTerima1Data = {
    nomor_ba: string;
    tgl_ba: string;
    ppk_nama: string;
    ppk_nip: string;
    rekanan_nama: string;
    rekanan_jabatan: string;
    rekanan_perusahaan: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 7. Surat Perintah Pengeluaran/Penyaluran Barang
export type SuratPerintahPengeluaranData = {
    nomor_surat: string;
    tgl_surat: string;
    pa_nama: string;
    pa_nip: string;
    pengurus_barang_nama: string;
    pengurus_barang_nip: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 8. Berita Acara Penerimaan Barang (oleh PA & Pengurus Barang)
export type BAPenerimaanData = {
    nomor_ba: string;
    tgl_ba: string;
    pa_nama: string;
    pa_nip: string;
    pengurus_barang_nama: string;
    pengurus_barang_nip: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 9. Berita Acara Serah Terima Barang (antara Pengurus Barang dan PPTK)
export type BASerahTerimaPPTKData = {
    nomor_ba: string;
    tgl_ba: string;
    pengurus_barang_nama: string;
    pengurus_barang_nip: string;
    pptk_nama: string;
    pptk_nip: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 10. Surat Pernyataan (oleh Pengurus Barang)
export type SuratPernyataanData = {
    tgl_surat: string;
    pengurus_barang_nama: string;
    pengurus_barang_nip: string;
    pekerjaan: string;
    instansi: string;
    rupId: string;
    items: FormItem[];
};

// 11. Lembar Verifikasi (oleh PPK Keuangan) - Data diambil dari VerificationSheet
export type LembarVerifikasiData = {
    // Data ini akan diisi dari model VerificationSheet dan relasinya
    // Tidak perlu field input form, hanya metadata
    spjId: string;
    validator_nama: string;
    validator_nip: string;
    verifier_nama: string;
    verifier_nip: string;
    notes_verifikasi: string;
    notes_finalisasi: string;
    status_verifikasi: "valid" | "invalid";
    status_finalisasi: "completed" | "rejected";
};

// --- Union Type untuk Semua Data Form ---
export type AllFormData =
    | SpbData
    | BuktiPembelianData
    | KwitansiData
    | PermohonanSerahTerimaData
    | PenyerahanBarangData
    | BASerahTerima1Data
    | SuratPerintahPengeluaranData
    | BAPenerimaanData
    | BASerahTerimaPPTKData
    | SuratPernyataanData
    | LembarVerifikasiData;

// --- Mapping Form Type ke Data Type ---
export type FormTypeMap = {
    1: SpbData;
    2: BuktiPembelianData;
    3: KwitansiData;
    4: PermohonanSerahTerimaData;
    5: PenyerahanBarangData;
    6: BASerahTerima1Data;
    7: SuratPerintahPengeluaranData;
    8: BAPenerimaanData;
    9: BASerahTerimaPPTKData;
    10: SuratPernyataanData;
    11: LembarVerifikasiData;
};

// --- Form Type Enum/Constant ---
export const FormTypes = {
    SPB: 1,
    BUKTI_PEMBELIAN: 2,
    KWITANSI: 3,
    PERMOHONAN_SERAH_TERIMA: 4,
    PENYERAHAN_BARANG: 5,
    BA_SERAH_TERIMA_1: 6,
    SURAT_PERINTAH_PENGELUARAN: 7,
    BA_PENERIMAAN: 8,
    BA_SERAH_TERIMA_PPTK: 9,
    SURAT_PERNYATAAN: 10,
    LEMBAR_VERIFIKASI: 11,
};

// --- Tipe Data dengan Relasi ---

export type SpjForm = {
    id?: string;
    spjSubmissionId?: string | null;
    formType?: number | null; // Ubah ke number
    data?: AllFormData; // Gunakan union type
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
    status?: string; // Tambahkan status
    physicalSignatureScanUrl?: string | null; // Tambahkan scan URL
    physicalSignatureFileType?: "pdf" | "excel" | null; // Tambahkan file type
};

export type SpjWithRelations = SpjSubmission & {
    forms: SpjForm[];
    operator: User;
    verification?:
        | (VerificationSheet & {
              validator?: User | null;
              verifier?: User | null;
              notes?: string | null;
              finalNotes?: string | null;
          })
        | null;
};

export type SpjMetadata = {
    rupId: string;
    year: number;
    activityName: string;
    activity: string; // Tambahkan ini
    status: string;
};
