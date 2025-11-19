// src/utils/excelGenerator.ts
import ExcelJS from "exceljs";
import {
    SpjSubmission,
    SpjForm,
    User,
    VerificationSheet,
} from "../generated/prisma";

// Type untuk SPJ yang sudah di-include
type SpjWithRelations = SpjSubmission & {
    forms: SpjForm[];
    operator: User;
    verification?:
        | (VerificationSheet & {
              validator?: User | null;
              verifier?: User | null;
          })
        | null;
};

/**
 * Helper: Ambil data form berdasarkan formType
 */
const getFormData = (forms: SpjForm[], formType: number): any => {
    const form = forms.find((f) => f.formType === formType);
    return form?.data ? (form.data as any) : {};
};

/**
 * Helper: Ambil nilai string aman
 */
const safeString = (value: any): string => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
};

/**
 * Helper: Format currency
 */
const formatCurrency = (value: any): string => {
    if (!value) return "0";
    const num =
        typeof value === "string"
            ? parseFloat(value.replace(/[^\d]/g, ""))
            : value;
    return new Intl.NumberFormat("id-ID").format(num);
};

/**
 * Helper: Apply header style
 */
const applyHeaderStyle = (cell: ExcelJS.Cell, fontSize: number = 14) => {
    cell.font = { bold: true, size: fontSize, name: "Arial" };
    cell.alignment = { horizontal: "center", vertical: "middle" };
};

/**
 * Helper: Apply table header style
 */
const applyTableHeaderStyle = (
    sheet: ExcelJS.Worksheet,
    row: number,
    columns: string[]
) => {
    columns.forEach((col) => {
        const cell = sheet.getCell(`${col}${row}`);
        cell.font = { bold: true, name: "Arial", size: 10 };
        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
        };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
    });
};

/**
 * Helper: Apply table cell border
 */
const applyTableBorder = (cell: ExcelJS.Cell) => {
    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
    };
};

/**
 * Helper: Set column widths
 */
const setColumnWidths = (
    sheet: ExcelJS.Worksheet,
    widths: { [key: string]: number }
) => {
    Object.entries(widths).forEach(([col, width]) => {
        sheet.getColumn(col).width = width;
    });
};

/**
 * 1. Surat Pesanan Barang (SPB)
 */
const addSPBSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("1. Surat Pesanan Barang");
    const data = getFormData(forms, 1);

    // Set column widths
    setColumnWidths(sheet, {
        A: 5,
        B: 35,
        C: 10,
        D: 10,
        E: 10,
        F: 12,
        G: 12,
        H: 15,
        I: 15,
    });

    // Header
    sheet.mergeCells("A1:I1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "SURAT PESANAN BARANG (SPB)";
    applyHeaderStyle(headerCell, 16);

    // Info
    sheet.getCell("A3").value = `Nomor    : ${safeString(
        data.nomor_spb || ""
    )}`;
    sheet.getCell("A4").value = `Nomor ID RUP : ${safeString(
        data.id_rup || spj.rupId
    )}`;

    sheet.getCell("A6").value = "Dengan ini diberitahukan kepada :";
    sheet.getCell("A6").font = { bold: true };

    sheet.getCell("A8").value = `Nama Rekanan : ${safeString(
        data.rekanan || ""
    )}`;
    sheet.getCell("A9").value = `Alamat       : ${safeString(
        data.alamat_rekanan || ""
    )}`;

    sheet.getCell("A11").value = `Untuk melaksanakan Pekerjaan ${safeString(
        data.pekerjaan || spj.activityName
    )} kegiatan ${safeString(spj.activityName)} pada ${safeString(
        data.instansi || ""
    )}`;
    sheet.getCell("A11").alignment = { wrapText: true };

    // Table Header
    const tableStart = 13;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "F", "G", "H", "I"]);
    sheet.getCell(`A${tableStart}`).value = "No.";
    sheet.mergeCells(`B${tableStart}:E${tableStart}`);
    sheet.getCell(`B${tableStart}`).value =
        "Jenis Barang, Kapasitas dan lain-lain";
    sheet.getCell(`F${tableStart}`).value = "Volume";
    sheet.getCell(`G${tableStart}`).value = "Satuan";
    sheet.getCell(`H${tableStart}`).value = "Harga Satuan";
    sheet.getCell(`I${tableStart}`).value = "Jumlah Harga";

    // Table Data
    let currentRow = tableStart + 1;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            totalAmount += itemTotal;

            sheet.getCell(`A${currentRow}`).value = i + 1;
            sheet.mergeCells(`B${currentRow}:E${currentRow}`);
            sheet.getCell(`B${currentRow}`).value = safeString(item.nama);
            sheet.getCell(`F${currentRow}`).value = safeString(item.volume);
            sheet.getCell(`G${currentRow}`).value = safeString(item.satuan);
            sheet.getCell(`H${currentRow}`).value = formatCurrency(item.harga);
            sheet.getCell(`I${currentRow}`).value = formatCurrency(itemTotal);

            ["A", "B", "F", "G", "H", "I"].forEach((col) => {
                applyTableBorder(sheet.getCell(`${col}${currentRow}`));
                sheet.getCell(`${col}${currentRow}`).alignment = {
                    vertical: "middle",
                    wrapText: true,
                };
            });

            currentRow++;
        });
    }

    // Total Row
    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "JUMLAH";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
    sheet.getCell(`I${currentRow}`).value = formatCurrency(
        data.total || totalAmount
    );
    sheet.getCell(`I${currentRow}`).font = { bold: true };
    ["A", "I"].forEach((col) =>
        applyTableBorder(sheet.getCell(`${col}${currentRow}`))
    );

    currentRow += 2;
    sheet.getCell(
        `A${currentRow}`
    ).value = `Pesanan pada Rekanan terhitung mulai tanggal ${safeString(
        data.tgl_mulai || ""
    )} sampai dengan tanggal ${safeString(data.tgl_selesai || "")}`;

    currentRow += 2;
    sheet.getCell(
        `A${currentRow}`
    ).value = `Nilai Pekerjaan Rp. ${formatCurrency(
        data.nilai || data.total || totalAmount
    )},- (${safeString(data.nilai_terbilang || "")}).`;
    sheet.getCell(`A${currentRow}`).font = { bold: true };

    // Signature
    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${safeString(
        data.tgl_ttd || new Date().toLocaleDateString("id-ID")
    )}`;
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = "Pejabat Pembuat Komitmen";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(data.ppk_nama || "");
    sheet.getCell(`A${currentRow}`).font = { bold: true, underline: true };
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = `NIP. ${safeString(
        data.ppk_nip || ""
    )}`;
};

/**
 * 2. Bukti Pembelian
 */
const addBuktiPembelianSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("2. Bukti Pembelian");
    const data = getFormData(forms, 2);

    setColumnWidths(sheet, {
        A: 5,
        B: 35,
        C: 10,
        D: 10,
        E: 10,
        F: 12,
        G: 12,
        H: 15,
        I: 15,
    });

    sheet.mergeCells("A1:I1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "BUKTI PEMBELIAN";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = safeString(
        data.sub_kegiatan || spj.activityName
    );
    sheet.getCell("A3").font = { bold: true };
    sheet.getCell("A4").value = `ID RUP        : ${safeString(
        data.id_rup || spj.rupId
    )}`;
    sheet.getCell("A5").value = `Tahun Anggaran: ${safeString(
        data.tahun_anggaran || spj.year
    )}`;

    const tableStart = 7;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "F", "G", "H", "I"]);
    sheet.getCell(`A${tableStart}`).value = "NO";
    sheet.mergeCells(`B${tableStart}:E${tableStart}`);
    sheet.getCell(`B${tableStart}`).value = "NAMA BARANG";
    sheet.getCell(`F${tableStart}`).value = "VOLUME";
    sheet.getCell(`G${tableStart}`).value = "SATUAN";
    sheet.getCell(`H${tableStart}`).value = "HARGA SATUAN";
    sheet.getCell(`I${tableStart}`).value = "JUMLAH";

    let currentRow = tableStart + 1;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            totalAmount += itemTotal;

            sheet.getCell(`A${currentRow}`).value = i + 1;
            sheet.mergeCells(`B${currentRow}:E${currentRow}`);
            sheet.getCell(`B${currentRow}`).value = safeString(item.nama);
            sheet.getCell(`F${currentRow}`).value = safeString(item.volume);
            sheet.getCell(`G${currentRow}`).value = safeString(item.satuan);
            sheet.getCell(`H${currentRow}`).value = formatCurrency(item.harga);
            sheet.getCell(`I${currentRow}`).value = formatCurrency(itemTotal);

            ["A", "B", "F", "G", "H", "I"].forEach((col) => {
                applyTableBorder(sheet.getCell(`${col}${currentRow}`));
            });

            currentRow++;
        });
    }

    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "JUMLAH";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
    sheet.getCell(`I${currentRow}`).value = formatCurrency(
        data.total || totalAmount
    );
    sheet.getCell(`I${currentRow}`).font = { bold: true };
    ["A", "I"].forEach((col) =>
        applyTableBorder(sheet.getCell(`${col}${currentRow}`))
    );

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `TERBILANG: ${safeString(
        data.jumlah_terbilang || ""
    )}`;
    sheet.getCell(`A${currentRow}`).font = { italic: true };

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = "Yang Menerima";
    sheet.getCell(`G${currentRow}`).value = "Yang Menyerahkan";
    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(
        data.penerima_nama || ""
    );
    sheet.getCell(`G${currentRow}`).value = safeString(
        data.penyerah_nama || data.rekanan || ""
    );
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = `NIP. ${safeString(
        data.penerima_nip || ""
    )}`;
};

/**
 * 3. Kwitansi
 */
const addKwitansiSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("3. Kwitansi");
    const data = getFormData(forms, 3);

    setColumnWidths(sheet, { A: 20, B: 20, C: 20, D: 20 });

    sheet.mergeCells("A1:D1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "K U I T A N S I";
    applyHeaderStyle(headerCell, 18);

    sheet.getCell("A3").value = `TERIMA DARI`;
    sheet.getCell("A3").font = { bold: true };
    sheet.mergeCells("B3:D3");
    sheet.getCell("B3").value = `: ${safeString(data.penerima || "")}`;

    sheet.getCell("A5").value = `BANYAKNYA UANG`;
    sheet.getCell("A5").font = { bold: true };
    sheet.mergeCells("B5:D5");
    sheet.getCell("B5").value = `: Rp ${formatCurrency(data.jumlah || "")},-`;

    sheet.getCell("A7").value = `UNTUK PEMBAYARAN`;
    sheet.getCell("A7").font = { bold: true };
    sheet.mergeCells("B7:D7");
    sheet.getCell("B7").value = `: ${safeString(
        data.keperluan || spj.activityName
    )}`;
    sheet.getCell("B7").alignment = { wrapText: true };

    sheet.getCell("A9").value = `ID RUP`;
    sheet.getCell("A9").font = { bold: true };
    sheet.mergeCells("B9:D9");
    sheet.getCell("B9").value = `: ${safeString(data.id_rup || spj.rupId)}`;

    sheet.getCell("A11").value = `TANGGAL`;
    sheet.getCell("A11").font = { bold: true };
    sheet.mergeCells("B11:D11");
    sheet.getCell("B11").value = `: ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;

    sheet.mergeCells("A13:D13");
    sheet.getCell("A13").value = `TERBILANG: ${safeString(
        data.jumlah_terbilang || ""
    )}`;
    sheet.getCell("A13").font = { italic: true, bold: true };
    sheet.getCell("A13").alignment = { horizontal: "center" };

    sheet.getCell("A16").value = "Mengetahui/Menyetujui";
    sheet.getCell("A17").value = "Pengguna Anggaran";
    sheet.getCell("C16").value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;
    sheet.getCell("C17").value = "Yang Menerima";

    sheet.getCell("A20").value = safeString(data.pa_nama || "");
    sheet.getCell("A20").font = { bold: true, underline: true };
    sheet.getCell("C20").value = safeString(
        data.penerima_nama || data.rekanan || ""
    );
    sheet.getCell("C20").font = { bold: true, underline: true };

    sheet.getCell("A21").value = `NIP. ${safeString(data.pa_nip || "")}`;
};

/**
 * 4. Permohonan Serah Terima
 */
const addPermohonanSerahTerimaSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("4. Permohonan Serah Terima");
    const data = getFormData(forms, 4);

    setColumnWidths(sheet, { A: 25, B: 40 });

    sheet.mergeCells("A1:B1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "PERMOHONAN SERAH TERIMA";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = "Nama Pekerjaan";
    sheet.getCell("B3").value = `: ${safeString(
        data.nama_pekerjaan || spj.activityName
    )}`;

    sheet.getCell("A4").value = "Nilai";
    sheet.getCell("B4").value = `: Rp ${formatCurrency(data.nilai || "")},-`;

    sheet.getCell("A5").value = "Masa Pelaksanaan";
    sheet.getCell("B5").value = `: ${safeString(data.masa_pelaksanaan || "")}`;

    sheet.getCell("A6").value = "SPB";
    sheet.getCell("B6").value = `: Nomor: ${safeString(
        data.nomor_spb || ""
    )}, Tanggal: ${safeString(data.tgl_spb || "")}`;

    sheet.getCell("A8").value =
        "Dengan ini mengajukan permohonan serah terima hasil pekerjaan tersebut di atas.";
    sheet.getCell("A8").alignment = { wrapText: true };

    sheet.getCell("A11").value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;
    sheet.getCell("A12").value = "Yang Mengajukan";
    sheet.getCell("A15").value = safeString(
        data.operator_nama || spj.operator.name
    );
    sheet.getCell("A15").font = { bold: true, underline: true };
    sheet.getCell("A16").value = `NIP. ${safeString(data.operator_nip || "")}`;
};

/**
 * 5. Penyerahan Barang
 */
const addPenyerahanBarangSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("5. Penyerahan Barang");
    const data = getFormData(forms, 5);

    setColumnWidths(sheet, { A: 25, B: 40 });

    sheet.mergeCells("A1:B1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "PENYERAHAN BARANG";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = "Nomor";
    sheet.getCell("B3").value = `: ${safeString(data.nomor || "")}`;

    sheet.getCell("A4").value = "Uraian";
    sheet.getCell("B4").value = `: ${safeString(
        data.uraian || spj.activityName
    )}`;
    sheet.getCell("B4").alignment = { wrapText: true };

    sheet.getCell("A6").value =
        "Telah diserahkan barang-barang sesuai dengan Surat Pesanan Barang untuk digunakan sebagaimana mestinya.";
    sheet.getCell("A6").alignment = { wrapText: true };

    sheet.getCell("A9").value = "Yang Menyerahkan";
    sheet.getCell("B9").value = "Yang Menerima";

    sheet.getCell("A10").value = "Pejabat Pembuat Komitmen";
    sheet.getCell("B10").value = "Pengurus Barang";

    sheet.getCell("A13").value = safeString(data.ppk_nama || "");
    sheet.getCell("A13").font = { bold: true, underline: true };
    sheet.getCell("B13").value = safeString(data.pengurus_nama || "");
    sheet.getCell("B13").font = { bold: true, underline: true };

    sheet.getCell("A14").value = `NIP. ${safeString(data.ppk_nip || "")}`;
    sheet.getCell("B14").value = `NIP. ${safeString(data.pengurus_nip || "")}`;

    sheet.getCell("A16").value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;
};

/**
 * 6. Berita Acara Serah Terima Barang (Pertama)
 */
const addBA_SerahTerima_1_Sheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("6. BA Serah Terima Barang");
    const data = getFormData(forms, 6);

    setColumnWidths(sheet, {
        A: 5,
        B: 35,
        C: 10,
        D: 10,
        E: 10,
        F: 12,
        G: 12,
        H: 15,
        I: 15,
    });

    sheet.mergeCells("A1:I1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "BERITA ACARA SERAH TERIMA BARANG";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = "Yang bertandatangan di bawah ini:";
    sheet.getCell("A3").font = { bold: true };

    sheet.getCell("A5").value = `1. Nama  : ${safeString(data.ppk_nama || "")}`;
    sheet.getCell("A6").value = `   NIP   : ${safeString(data.ppk_nip || "")}`;
    sheet.getCell("A7").value = `   Selaku: Pejabat Pembuat Komitmen`;

    sheet.getCell("A9").value = `2. Nama    : ${safeString(
        data.rekanan_nama || ""
    )}`;
    sheet.getCell("A10").value = `   Jabatan : ${safeString(
        data.rekanan_jabatan || "Direktur"
    )}`;
    sheet.getCell("A11").value = `   Alamat  : ${safeString(
        data.rekanan_alamat || ""
    )}`;

    sheet.getCell("A13").value =
        "Dengan ini menyatakan telah melakukan serah terima barang dengan rincian sebagai berikut:";

    const tableStart = 15;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "F", "G", "H", "I"]);
    sheet.getCell(`A${tableStart}`).value = "NO";
    sheet.mergeCells(`B${tableStart}:E${tableStart}`);
    sheet.getCell(`B${tableStart}`).value = "NAMA BARANG";
    sheet.getCell(`F${tableStart}`).value = "VOLUME";
    sheet.getCell(`G${tableStart}`).value = "SATUAN";
    sheet.getCell(`H${tableStart}`).value = "HARGA SATUAN";
    sheet.getCell(`I${tableStart}`).value = "JUMLAH HARGA";

    let currentRow = tableStart + 1;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            totalAmount += itemTotal;

            sheet.getCell(`A${currentRow}`).value = i + 1;
            sheet.mergeCells(`B${currentRow}:E${currentRow}`);
            sheet.getCell(`B${currentRow}`).value = safeString(item.nama);
            sheet.getCell(`F${currentRow}`).value = safeString(item.volume);
            sheet.getCell(`G${currentRow}`).value = safeString(item.satuan);
            sheet.getCell(`H${currentRow}`).value = formatCurrency(item.harga);
            sheet.getCell(`I${currentRow}`).value = formatCurrency(itemTotal);

            ["A", "B", "F", "G", "H", "I"].forEach((col) => {
                applyTableBorder(sheet.getCell(`${col}${currentRow}`));
            });

            currentRow++;
        });
    }

    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "JUMLAH";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
    sheet.getCell(`I${currentRow}`).value = formatCurrency(
        data.total || totalAmount
    );
    sheet.getCell(`I${currentRow}`).font = { bold: true };
    ["A", "I"].forEach((col) =>
        applyTableBorder(sheet.getCell(`${col}${currentRow}`))
    );

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Yang Menyerahkan";
    sheet.getCell(`F${currentRow}`).value = "Yang Menerima";

    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(data.rekanan_nama || "");
    sheet.getCell(`A${currentRow}`).font = { bold: true, underline: true };
    sheet.getCell(`F${currentRow}`).value = safeString(data.ppk_nama || "");
    sheet.getCell(`F${currentRow}`).font = { bold: true, underline: true };

    currentRow++;
    sheet.getCell(`F${currentRow}`).value = `NIP. ${safeString(
        data.ppk_nip || ""
    )}`;
};

/**
 * 7. Surat Perintah Pengeluaran
 */
const addSuratPerintahPengeluaranSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("7. Surat Perintah Pengeluaran");
    const data = getFormData(forms, 7);

    setColumnWidths(sheet, {
        A: 5,
        B: 35,
        C: 10,
        D: 10,
        E: 10,
        F: 12,
        G: 12,
        H: 15,
        I: 15,
    });

    sheet.mergeCells("A1:I1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "SURAT PERINTAH PENGELUARAN/PENYALURAN BARANG";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = `Nomor : ${safeString(data.nomor || "")}`;
    sheet.getCell("A3").font = { bold: true };

    sheet.getCell("A5").value = `Dari   : Pengguna Anggaran`;
    sheet.getCell("A6").value = `Kepada : Pengurus Barang`;
    sheet.getCell("A7").value = `Alamat : ${safeString(
        data.alamat || "Jalan Garuda No. 1 Sumbawa Besar"
    )}`;

    sheet.getCell(
        "A9"
    ).value = `Harap dikeluarkan dan disalurkan barang untuk Sub Kegiatan ${safeString(
        data.sub_kegiatan || spj.activityName
    )}`;
    sheet.getCell("A9").alignment = { wrapText: true };

    const tableStart = 11;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "F", "G", "H", "I"]);
    sheet.getCell(`A${tableStart}`).value = "No.";
    sheet.mergeCells(`B${tableStart}:E${tableStart}`);
    sheet.getCell(`B${tableStart}`).value = "Nama Barang";
    sheet.getCell(`F${tableStart}`).value = "Volume";
    sheet.getCell(`G${tableStart}`).value = "Satuan";
    sheet.getCell(`H${tableStart}`).value = "Harga Satuan";
    sheet.getCell(`I${tableStart}`).value = "Jumlah Harga";

    let currentRow = tableStart + 1;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            totalAmount += itemTotal;

            sheet.getCell(`A${currentRow}`).value = i + 1;
            sheet.mergeCells(`B${currentRow}:E${currentRow}`);
            sheet.getCell(`B${currentRow}`).value = safeString(item.nama);
            sheet.getCell(`F${currentRow}`).value = safeString(item.volume);
            sheet.getCell(`G${currentRow}`).value = safeString(item.satuan);
            sheet.getCell(`H${currentRow}`).value = formatCurrency(item.harga);
            sheet.getCell(`I${currentRow}`).value = formatCurrency(itemTotal);

            ["A", "B", "F", "G", "H", "I"].forEach((col) => {
                applyTableBorder(sheet.getCell(`${col}${currentRow}`));
            });

            currentRow++;
        });
    }

    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "JUMLAH TOTAL";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
    sheet.getCell(`I${currentRow}`).value = formatCurrency(
        data.total || totalAmount
    );
    sheet.getCell(`I${currentRow}`).font = { bold: true };
    ["A", "I"].forEach((col) =>
        applyTableBorder(sheet.getCell(`${col}${currentRow}`))
    );

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Pengguna Anggaran";

    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(data.pa_nama || "");
    sheet.getCell(`A${currentRow}`).font = { bold: true, underline: true };

    currentRow++;
    sheet.getCell(`A${currentRow}`).value = `NIP. ${safeString(
        data.pa_nip || ""
    )}`;
};

/**
 * 8. Berita Acara Penerimaan Barang
 */
const addBA_PenerimaanSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("8. BA Penerimaan Barang");
    const data = getFormData(forms, 8);

    setColumnWidths(sheet, {
        A: 5,
        B: 35,
        C: 10,
        D: 10,
        E: 10,
        F: 12,
        G: 15,
        H: 15,
    });

    sheet.mergeCells("A1:H1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "BERITA ACARA PENERIMAAN BARANG";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = `Nomor: ${safeString(data.nomor || "")}`;
    sheet.getCell("A3").font = { bold: true };

    sheet.getCell("A5").value = `Pada hari ini ${safeString(
        data.hari || ""
    )} tanggal ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}, yang bertanda tangan di bawah ini:`;

    sheet.getCell("A7").value = `1. Nama    : ${safeString(
        data.pa_nama || ""
    )}`;
    sheet.getCell("A8").value = `   NIP     : ${safeString(data.pa_nip || "")}`;
    sheet.getCell("A9").value = `   Jabatan : Pengguna Anggaran / Kepala Dinas`;

    sheet.getCell("A11").value = `2. Nama    : ${safeString(
        data.pengurus_nama || ""
    )}`;
    sheet.getCell("A12").value = `   NIP     : ${safeString(
        data.pengurus_nip || ""
    )}`;
    sheet.getCell("A13").value = `   Jabatan : Pengurus Barang`;

    sheet.getCell("A15").value =
        "Menyatakan dengan sesungguhnya bahwa telah diterima barang-barang sebagai berikut:";

    const tableStart = 17;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "F", "G", "H"]);
    sheet.getCell(`A${tableStart}`).value = "No.";
    sheet.mergeCells(`B${tableStart}:E${tableStart}`);
    sheet.getCell(`B${tableStart}`).value = "Jenis Barang";
    sheet.getCell(`F${tableStart}`).value = "Banyaknya";
    sheet.getCell(`G${tableStart}`).value = "Harga Satuan";
    sheet.getCell(`H${tableStart}`).value = "Jumlah Harga";

    let currentRow = tableStart + 1;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            totalAmount += itemTotal;

            sheet.getCell(`A${currentRow}`).value = i + 1;
            sheet.mergeCells(`B${currentRow}:E${currentRow}`);
            sheet.getCell(`B${currentRow}`).value = safeString(item.nama);
            sheet.getCell(`F${currentRow}`).value = `${safeString(
                item.volume
            )} ${safeString(item.satuan)}`;
            sheet.getCell(`G${currentRow}`).value = formatCurrency(item.harga);
            sheet.getCell(`H${currentRow}`).value = formatCurrency(itemTotal);

            ["A", "B", "F", "G", "H"].forEach((col) => {
                applyTableBorder(sheet.getCell(`${col}${currentRow}`));
            });

            currentRow++;
        });
    }

    sheet.mergeCells(`A${currentRow}:G${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "JUMLAH";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
    sheet.getCell(`H${currentRow}`).value = formatCurrency(
        data.total || totalAmount
    );
    sheet.getCell(`H${currentRow}`).font = { bold: true };
    ["A", "H"].forEach((col) =>
        applyTableBorder(sheet.getCell(`${col}${currentRow}`))
    );

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Yang Menyerahkan";
    sheet.getCell(`F${currentRow}`).value = "Yang Menerima";

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Pengurus Barang";
    sheet.getCell(`F${currentRow}`).value = "Pengguna Anggaran";

    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(
        data.pengurus_nama || ""
    );
    sheet.getCell(`A${currentRow}`).font = { bold: true, underline: true };
    sheet.getCell(`F${currentRow}`).value = safeString(data.pa_nama || "");
    sheet.getCell(`F${currentRow}`).font = { bold: true, underline: true };

    currentRow++;
    sheet.getCell(`A${currentRow}`).value = `NIP. ${safeString(
        data.pengurus_nip || ""
    )}`;
    sheet.getCell(`F${currentRow}`).value = `NIP. ${safeString(
        data.pa_nip || ""
    )}`;
};

/**
 * 9. Berita Acara Serah Terima (PPTK)
 */
const addBA_SerahTerima_PPTK_Sheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("9. BA Serah Terima (PPTK)");
    const data = getFormData(forms, 9);

    setColumnWidths(sheet, {
        A: 5,
        B: 35,
        C: 10,
        D: 10,
        E: 10,
        F: 12,
        G: 15,
        H: 15,
    });

    sheet.mergeCells("A1:H1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "BERITA ACARA SERAH TERIMA BARANG";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = `Nomor: ${safeString(data.nomor || "")}`;
    sheet.getCell("A3").font = { bold: true };

    sheet.getCell("A5").value = "Yang bertanda tangan dibawah ini:";

    sheet.getCell("A7").value = `1. Nama    : ${safeString(
        data.pengurus_nama || ""
    )}`;
    sheet.getCell("A8").value = `   NIP     : ${safeString(
        data.pengurus_nip || ""
    )}`;
    sheet.getCell("A9").value = `   Selaku  : Pengurus Barang`;

    sheet.getCell("A11").value = `2. Nama    : ${safeString(
        data.pptk_nama || ""
    )}`;
    sheet.getCell("A12").value = `   NIP     : ${safeString(
        data.pptk_nip || ""
    )}`;
    sheet.getCell("A13").value = `   Selaku  : PPTK / Penerima Barang`;

    sheet.getCell("A15").value =
        "Menyatakan telah melakukan serah terima barang dengan rincian sebagai berikut:";

    const tableStart = 17;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "F", "G", "H"]);
    sheet.getCell(`A${tableStart}`).value = "No.";
    sheet.mergeCells(`B${tableStart}:E${tableStart}`);
    sheet.getCell(`B${tableStart}`).value = "Jenis Barang";
    sheet.getCell(`F${tableStart}`).value = "Banyaknya";
    sheet.getCell(`G${tableStart}`).value = "Harga Satuan";
    sheet.getCell(`H${tableStart}`).value = "Jumlah Harga";

    let currentRow = tableStart + 1;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            totalAmount += itemTotal;

            sheet.getCell(`A${currentRow}`).value = i + 1;
            sheet.mergeCells(`B${currentRow}:E${currentRow}`);
            sheet.getCell(`B${currentRow}`).value = safeString(item.nama);
            sheet.getCell(`F${currentRow}`).value = `${safeString(
                item.volume
            )} ${safeString(item.satuan)}`;
            sheet.getCell(`G${currentRow}`).value = formatCurrency(item.harga);
            sheet.getCell(`H${currentRow}`).value = formatCurrency(itemTotal);

            ["A", "B", "F", "G", "H"].forEach((col) => {
                applyTableBorder(sheet.getCell(`${col}${currentRow}`));
            });

            currentRow++;
        });
    }

    sheet.mergeCells(`A${currentRow}:G${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "JUMLAH";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
    sheet.getCell(`H${currentRow}`).value = formatCurrency(
        data.total || totalAmount
    );
    sheet.getCell(`H${currentRow}`).font = { bold: true };
    ["A", "H"].forEach((col) =>
        applyTableBorder(sheet.getCell(`${col}${currentRow}`))
    );

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Yang Menyerahkan";
    sheet.getCell(`F${currentRow}`).value = "Yang Menerima";

    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(
        data.pengurus_nama || ""
    );
    sheet.getCell(`A${currentRow}`).font = { bold: true, underline: true };
    sheet.getCell(`F${currentRow}`).value = safeString(data.pptk_nama || "");
    sheet.getCell(`F${currentRow}`).font = { bold: true, underline: true };

    currentRow++;
    sheet.getCell(`A${currentRow}`).value = `NIP. ${safeString(
        data.pengurus_nip || ""
    )}`;
    sheet.getCell(`F${currentRow}`).value = `NIP. ${safeString(
        data.pptk_nip || ""
    )}`;
};

/**
 * 10. Surat Pernyataan
 */
const addSuratPernyataanSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const sheet = workbook.addWorksheet("10. Surat Pernyataan");
    const data = getFormData(forms, 10);

    setColumnWidths(sheet, { A: 25, B: 50 });

    sheet.mergeCells("A1:B1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "SURAT PERNYATAAN";
    applyHeaderStyle(headerCell, 16);

    sheet.getCell("A3").value = `Nomor: ${safeString(data.nomor || "")}`;
    sheet.getCell("A3").font = { bold: true };

    sheet.getCell("A5").value = `Pada hari ini ${safeString(
        data.hari || ""
    )} tanggal ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}, yang bertanda tangan dibawah ini:`;

    sheet.getCell("A7").value = `Nama          : ${safeString(
        data.nama || ""
    )}`;
    sheet.getCell("A8").value = `NIP           : ${safeString(data.nip || "")}`;
    sheet.getCell("A9").value = `Pangkat/Gol   : ${safeString(
        data.golongan || ""
    )}`;
    sheet.getCell("A10").value = `Jabatan       : ${safeString(
        data.jabatan || "Pengurus Barang"
    )}`;

    sheet.getCell("A12").value =
        "Selaku Pengurus Barang, pada Dinas Komunikasi Informatika Statistik dan Persandian Kabupaten Sumbawa menyatakan bahwa, telah dilakukan pencatatan atau pembukuan sebagai Barang Milik Daerah yang diperoleh dari pengadaan APBD dengan rincian sebagai berikut:";
    sheet.getCell("A12").alignment = { wrapText: true };

    sheet.getCell("A14").value = `Kode Sub Kegiatan    : ${safeString(
        data.kode_sub_kegiatan || ""
    )}`;
    sheet.getCell("A15").value = `Nama Sub Kegiatan    : ${safeString(
        data.nama_sub_kegiatan || spj.activityName
    )}`;
    sheet.getCell("A16").value = `Kode Belanja         : ${safeString(
        data.kode_belanja || ""
    )}`;
    sheet.getCell("A17").value = `Uraian Belanja       : ${safeString(
        data.uraian_belanja || ""
    )}`;
    sheet.getCell("A18").value = `Bentuk Kontrak       : ${safeString(
        data.bentuk_kontrak || "SURAT PESANAN BARANG"
    )}`;
    sheet.getCell("A19").value = `  a. Nama Penyedia   : ${safeString(
        data.rekanan || ""
    )}`;
    sheet.getCell("A20").value = `  b. Nomor           : ${safeString(
        data.nomor_spb || ""
    )}`;
    sheet.getCell("A21").value = `  c. Tanggal         : ${safeString(
        data.tgl_spb || ""
    )}`;
    sheet.getCell("A22").value = `Tanggal Perolehan    : ${safeString(
        data.tgl_perolehan || ""
    )}`;
    sheet.getCell("A23").value = `Nilai (Rp.)          : Rp ${formatCurrency(
        data.nilai || ""
    )},-`;

    sheet.getCell("A25").value =
        "Demikian surat pernyataan ini dibuat untuk dipergunakan seperlunya, apabila terdapat kekeliruan akan dilakukan perbaikan sesuai ketentuan.";
    sheet.getCell("A25").alignment = { wrapText: true };

    sheet.getCell("A27").value = "Mengetahui";
    sheet.getCell("A27").alignment = { horizontal: "center" };

    sheet.getCell("A29").value = "Pengguna Anggaran";
    sheet.getCell("B29").value = "Pengurus Barang";

    sheet.getCell("A32").value = safeString(data.pa_nama || "");
    sheet.getCell("A32").font = { bold: true, underline: true };
    sheet.getCell("B32").value = safeString(data.nama || "");
    sheet.getCell("B32").font = { bold: true, underline: true };

    sheet.getCell("A33").value = `NIP. ${safeString(data.pa_nip || "")}`;
    sheet.getCell("B33").value = `NIP. ${safeString(data.nip || "")}`;

    sheet.getCell("B27").value = `Sumbawa Besar, ${safeString(
        data.tgl || new Date().toLocaleDateString("id-ID")
    )}`;
    sheet.getCell("B27").alignment = { horizontal: "center" };
};

/**
 * 11. Lembar Verifikasi
 */
const addLembarVerifikasiSheet = (
    workbook: ExcelJS.Workbook,
    spj: SpjWithRelations
) => {
    const sheet = workbook.addWorksheet("11. Lembar Verifikasi");
    const verification = spj.verification;

    setColumnWidths(sheet, { A: 5, B: 40, C: 12, D: 12, E: 20, F: 15 });

    sheet.mergeCells("A1:F1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = "LEMBAR VERIFIKASI";
    applyHeaderStyle(headerCell, 16);

    sheet.mergeCells("A2:F2");
    const subHeaderCell = sheet.getCell("A2");
    subHeaderCell.value = "HASIL PEMBUKUAN PENGADAAN BMD";
    applyHeaderStyle(subHeaderCell, 12);

    sheet.getCell("A4").value = `Kuasa Pengguna Barang : ${safeString(
        verification?.validator?.name || ""
    )}`;
    sheet.getCell(
        "A5"
    ).value = `Pengguna Barang       : Dinas Komunikasi Informatika Statistik dan Persandian Kab. Sumbawa`;

    const tableStart = 7;
    applyTableHeaderStyle(sheet, tableStart, ["A", "B", "C", "D", "E", "F"]);
    sheet.getCell(`A${tableStart}`).value = "No.";
    sheet.getCell(`B${tableStart}`).value = "Uraian";
    sheet.getCell(`C${tableStart}`).value = "Sesuai (√)";
    sheet.getCell(`D${tableStart}`).value = "Tidak Sesuai";
    sheet.getCell(`E${tableStart}`).value = "Keterangan";
    sheet.getCell(`F${tableStart}`).value = "Jumlah";

    const checklist = [
        "Kode Sub Kegiatan",
        "Uraian Sub Kegiatan",
        "Kode Belanja",
        "Uraian Belanja",
        "Kode Barang",
        "Nama Barang",
        "Spesifikasi Barang",
        "Tanggal, Bulan, Tahun Perolehan",
        "Jumlah Barang",
        "Harga Satuan Barang",
        "Biaya Atribusi",
        "Lain-lain",
    ];

    let currentRow = tableStart + 1;
    checklist.forEach((item, i) => {
        sheet.getCell(`A${currentRow}`).value = i + 1;
        sheet.getCell(`B${currentRow}`).value = item;
        sheet.getCell(`C${currentRow}`).value =
            verification?.status === "valid" ? "√" : "";
        sheet.getCell(`D${currentRow}`).value =
            verification?.status !== "valid" ? "√" : "";
        sheet.getCell(`E${currentRow}`).value = "";
        sheet.getCell(`F${currentRow}`).value = "";

        ["A", "B", "C", "D", "E", "F"].forEach((col) => {
            applyTableBorder(sheet.getCell(`${col}${currentRow}`));
            sheet.getCell(`${col}${currentRow}`).alignment = {
                vertical: "middle",
            };
        });

        currentRow++;
    });

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Catatan:";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = safeString(
        verification?.notes || "-"
    );
    sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };

    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = `Sumbawa Besar, ${
        verification?.signedAt
            ? new Date(verification.signedAt).toLocaleDateString("id-ID")
            : new Date().toLocaleDateString("id-ID")
    }`;

    currentRow += 1;
    sheet.getCell(`A${currentRow}`).value = "Pengurus Barang";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    sheet.getCell(`A${currentRow}`).value =
        "Dinas Komunikasi Informatika Statistik dan Persandian Kab. Sumbawa";

    currentRow += 3;
    sheet.getCell(`A${currentRow}`).value = safeString(
        verification?.validator?.name || ""
    );
    sheet.getCell(`A${currentRow}`).font = { bold: true, underline: true };

    currentRow++;
    sheet.getCell(`A${currentRow}`).value = `NIP. ${safeString(
        (verification?.validator as any)?.nip || ""
    )}`;
};

/**
 * Fungsi Utama: Generate Excel
 */
export const generateSpjExcel = async (spj: any): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = "SPJ System";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Tambahkan sheet sesuai urutan SPJ
    addSPBSheet(workbook, spj, spj.forms);
    addBuktiPembelianSheet(workbook, spj, spj.forms);
    addKwitansiSheet(workbook, spj, spj.forms);
    addPermohonanSerahTerimaSheet(workbook, spj, spj.forms);
    addPenyerahanBarangSheet(workbook, spj, spj.forms);
    addBA_SerahTerima_1_Sheet(workbook, spj, spj.forms);
    addSuratPerintahPengeluaranSheet(workbook, spj, spj.forms);
    addBA_PenerimaanSheet(workbook, spj, spj.forms);
    addBA_SerahTerima_PPTK_Sheet(workbook, spj, spj.forms);
    addSuratPernyataanSheet(workbook, spj, spj.forms);
    addLembarVerifikasiSheet(workbook, spj);

    const buf = await workbook.xlsx.writeBuffer();
    // If the returned value is already a Node Buffer, return it directly;
    // otherwise convert the ArrayBuffer/Uint8Array into a Node Buffer.
    if (Buffer.isBuffer(buf)) {
        return buf;
    }
    // writeBuffer can return ArrayBuffer or Uint8Array - handle both explicitly
    if (buf instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(buf));
    }
    // Fallback: cast via unknown to satisfy TypeScript when it's a Uint8Array
    return Buffer.from(buf as unknown as Uint8Array);
};
