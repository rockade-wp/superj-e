// ==================== src/utils/format.ts ====================
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: string | Date): string {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: id });
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("id-ID").format(value);
}

export function getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
        draft: "badge-draft",
        filled: "badge-draft",
        physical_signed: "badge-signed",
        signed: "badge-signed",
        verified: "badge-verified",
        completed: "badge-completed",
        rejected: "badge-rejected",
    };
    return statusMap[status] || "badge-draft";
}

export function getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
        draft: "Draft",
        filled: "Terisi",
        physical_signed: "TTD Fisik",
        signed: "Ditandatangani",
        verified: "Terverifikasi",
        completed: "Selesai",
        rejected: "Ditolak",
    };
    return labelMap[status] || status;
}

export function getRoleName(role: string): string {
    const roleMap: Record<string, string> = {
        ADMIN: "Administrator",
        OPERATOR: "Operator",
        PPK: "Pejabat Pembuat Komitmen",
        PPTK: "Pejabat Pelaksana Teknis Kegiatan",
        PENGURUS_BARANG: "Pengurus Barang",
        PPK_KEUANGAN: "PPK Keuangan",
        PA: "Pengguna Anggaran",
    };
    return roleMap[role] || role;
}

export function getFormName(formType: number): string {
    const formNames: Record<number, string> = {
        1: "Surat Pesanan Barang (SPB)",
        2: "Bukti Pembelian",
        3: "Kwitansi",
        4: "Surat Permohonan Serah Terima Barang",
        5: "Surat Penyerahan Barang",
        6: "Berita Acara Serah Terima Barang (PPK & Rekanan)",
        7: "Surat Perintah Pengeluaran/Penyaluran Barang",
        8: "Berita Acara Penerimaan Barang",
        9: "Berita Acara Serah Terima Barang (Pengurus Barang & PPTK)",
        10: "Surat Pernyataan",
        11: "Lembar Verifikasi",
    };
    return formNames[formType] || `Form ${formType}`;
}
