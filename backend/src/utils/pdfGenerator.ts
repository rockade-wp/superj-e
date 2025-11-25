// src/utils/pdfGenerator.ts

import PDFDocument from "pdfkit";
import { SpjWithRelations, SpjMetadata } from "../types/spj";
type SpjForm = any;

// --- Helper Functions ---

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
            ? parseFloat(value.replace(/[^0-9,-]/g, "").replace(",", "."))
            : value;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
    }).format(num);
};

/**
 * Helper: Format currency tanpa simbol
 */
const formatNumber = (value: any): string => {
    if (!value) return "0";
    const num =
        typeof value === "string"
            ? parseFloat(value.replace(/[^0-9,-]/g, "").replace(",", "."))
            : value;
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
    }).format(num);
};

/**
 * Helper: Tambahkan header umum untuk semua form
 */
const addHeader = (doc: PDFKit.PDFDocument, title: string) => {
    doc.fontSize(16)
        .font("Helvetica-Bold")
        .text(title, { align: "center" })
        .moveDown(0.5);
    doc.fontSize(10)
        .font("Helvetica")
        .text("PEMERINTAH KABUPATEN SUMBAWA", { align: "center" });
    doc.text("DINAS KOMUNIKASI INFORMATIKA STATISTIK DAN PERSANDIAN", {
        align: "center",
    });
    doc.text("Jl. Garuda No. 1 Sumbawa Besar Kode Pos 84311", {
        align: "center",
    });
    doc.moveDown(1);
};

// --- Form Generators ---

/**
 * 1. Surat Pesanan Barang (SPB)
 */
const generateSPB = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 1);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "SURAT PESANAN BARANG (SPB)");

    doc.fontSize(10).font("Helvetica");
    doc.text(`Nomor: ${safeString(data.nomor_spb || "")}`, { continued: true })
        .text(`Nomor ID RUP: ${safeString(data.id_rup || spj.rupId)}`, {
            align: "right",
        })
        .moveDown(0.5);

    doc.font("Helvetica-Bold")
        .text("Dengan ini diberitahukan kepada :")
        .moveDown(0.5);
    doc.font("Helvetica")
        .text(`Nama Rekanan : ${safeString(data.rekanan || "")}`)
        .text(`Alamat       : ${safeString(data.alamat_rekanan || "")}`)
        .moveDown(0.5);

    doc.text(
        `Untuk melaksanakan Pekerjaan ${safeString(
            data.pekerjaan || spj.activityName
        )} kegiatan ${safeString(spj.activity)} pada ${safeString(
            data.instansi ||
                "Dinas Komunikasi Informatika Statistik dan Persandian Kab. Sumbawa"
        )} dan menyediakan barang-barang dengan ketentuan-ketentuan sebagai berikut :`
    ).moveDown(1);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Jenis Barang, Kapasitas dan lain-lain",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah Harga",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);
    doc.font("Helvetica")
        .text(
            `Pesanan pada Rekanan terhitung mulai tanggal ${safeString(
                data.tgl_mulai || ""
            )} sampai dengan tanggal ${safeString(data.tgl_selesai || "")}`
        )
        .moveDown(0.5);

    doc.font("Helvetica-Bold")
        .text(
            `Nilai Pekerjaan ${formatCurrency(
                data.nilai || data.total || totalAmount
            )},- (${safeString(data.nilai_terbilang || "")}).`
        )
        .moveDown(2);

    // Signature
    doc.font("Helvetica").text(
        `Sumbawa Besar, ${safeString(
            data.tgl_ttd || new Date().toLocaleDateString("id-ID")
        )}`,
        { align: "left" }
    );
    doc.font("Helvetica-Bold").text("Pejabat Pembuat Komitmen").moveDown(3);
    doc.text(safeString(data.ppk_nama || ""), { underline: true });
    doc.text(`NIP. ${safeString(data.ppk_nip || "")}`);
};

/**
 * 2. Bukti Pembelian
 */
const generateBuktiPembelian = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 2);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "BUKTI PEMBELIAN");

    doc.fontSize(10).font("Helvetica");
    doc.text(
        `SUB KEGIATAN: ${safeString(data.sub_kegiatan || spj.activityName)}`
    ).moveDown(0.2);
    doc.text(`ID RUP: ${safeString(data.id_rup || spj.rupId)}`).moveDown(0.2);
    doc.text(
        `Tahun Anggaran: ${safeString(data.tahun_anggaran || spj.year)}`
    ).moveDown(1);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Nama Barang",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);
    doc.font("Helvetica-Bold")
        .text(`TERBILANG : ${safeString(data.nilai_terbilang || "")}`)
        .moveDown(2);

    // Signature
    doc.font("Helvetica").text(
        `Sumbawa Besar, ${safeString(
            data.tgl_ttd || new Date().toLocaleDateString("id-ID")
        )}`,
        { align: "left" }
    );
    doc.font("Helvetica-Bold").text("Pejabat Pembuat Komitmen").moveDown(3);
    doc.text(safeString(data.ppk_nama || ""), { underline: true });
    doc.text(`NIP. ${safeString(data.ppk_nip || "")}`);
};

/**
 * 3. Kwitansi
 */
const generateKwitansi = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 3);

    addHeader(doc, "K W I T A N S I");

    doc.fontSize(10).font("Helvetica");
    doc.text(`Kode Rekening: ${safeString(data.kode_rekening || "")}`, {
        align: "right",
    }).moveDown(0.2);
    doc.text(`ID RUP: ${safeString(data.id_rup || spj.rupId)}`, {
        align: "right",
    }).moveDown(1);

    const labelWidth = 150;
    const valueX = doc.x + labelWidth;

    const drawRow = (
        label: string,
        value: string,
        isBold: boolean = false,
        isItalic: boolean = false
    ) => {
        doc.font("Helvetica").text(label, doc.x, doc.y, {
            width: labelWidth,
            continued: true,
        });
        doc.font(isBold ? "Helvetica-Bold" : "Helvetica").text(
            `: ${value}`,
            valueX,
            doc.y,
            { continued: false, oblique: isItalic }
        );
        doc.moveDown(0.5);
    };

    drawRow(
        "TERIMA DARI",
        safeString(
            data.penerima ||
                "Kepala Dinas Komunikasi Informatika Statistik dan Persandian Kabupaten Sumbawa"
        )
    );
    drawRow(
        "BANYAKNYA UANG",
        safeString(data.nilai_terbilang || ""),
        true,
        true
    );
    drawRow("UNTUK PEMBAYARAN", safeString(data.uraian || spj.activityName));

    doc.moveDown(1);
    doc.font("Helvetica-Bold").text("TERBILANG", doc.x, doc.y, {
        continued: true,
    });
    doc.rect(valueX, doc.y - 5, 300, 20).fillAndStroke("#D3D3D3", "black");
    doc.fillColor("black")
        .text(formatCurrency(data.nilai || 0), valueX + 5, doc.y, {
            width: 290,
            align: "left",
        })
        .moveDown(1);

    // Signature
    doc.moveDown(1);
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl_ttd || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "right" }
        )
        .moveDown(0.5);

    const signatureY = doc.y;
    const col1X = 50;
    const col2X = 350;

    doc.font("Helvetica-Bold").text(
        "Pejabat Pembuat Komitmen",
        col1X,
        signatureY
    );
    doc.text("Yang Menerima Uang", col2X, signatureY).moveDown(3);

    doc.font("Helvetica").text(safeString(data.ppk_nama || ""), col1X, doc.y, {
        underline: true,
    });
    doc.text(safeString(data.penerima_nama || ""), col2X, doc.y, {
        underline: true,
    });
    doc.moveDown(0.2);

    doc.text(`NIP. ${safeString(data.ppk_nip || "")}`, col1X, doc.y);
    doc.text(
        safeString(data.penerima_jabatan || "Direktur CV. Shomad Technology"),
        col2X,
        doc.y
    );
};

/**
 * 4. Surat Permohonan Serah Terima Barang
 */
const generatePermohonanSerahTerima = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 4);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "SURAT PERMOHONAN SERAH TERIMA BARANG");

    doc.fontSize(10).font("Helvetica");
    doc.text(`Nomor : ${safeString(data.nomor || "")}`).moveDown(1);

    doc.text(
        `Kepada Yth. ${safeString(data.kepada || "Pejabat Pembuat Komitmen")}`
    ).moveDown(1);

    doc.text(
        "Dengan hormat, bersama ini kami mengajukan permohonan serah terima barang untuk kegiatan:"
    ).moveDown(0.5);

    doc.font("Helvetica-Bold")
        .text(`Kegiatan: ${safeString(spj.activityName)}`)
        .moveDown(1);

    doc.font("Helvetica")
        .text("Adapun rincian barang yang dimohonkan adalah sebagai berikut:")
        .moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Nama Barang",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);

    // Signature
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl_ttd || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "left" }
        )
        .moveDown(0.5);
    doc.font("Helvetica-Bold").text("Yang Mengajukan").moveDown(3);
    doc.text(safeString(data.operator_nama || ""), { underline: true });
    doc.text(`NIP. ${safeString(data.operator_nip || "")}`);
};

/**
 * 5. Surat Penyerahan Barang (dari PPK ke PA)
 */
const generatePenyerahanBarang = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 5);

    addHeader(doc, "SURAT PENYERAHAN BARANG");

    doc.fontSize(10).font("Helvetica");
    doc.text(`Nomor : ${safeString(data.nomor || "")}`).moveDown(0.5);
    doc.text(
        `Uraian : ${safeString(data.uraian || spj.activityName)}`
    ).moveDown(1);

    doc.text(
        "Telah diserahkan barang-barang sesuai dengan Surat Pesanan Barang untuk digunakan sebagaimana mestinya."
    ).moveDown(2);

    const signatureY = doc.y;
    const col1X = 50;
    const col2X = 350;

    doc.font("Helvetica-Bold").text("Yang Menyerahkan", col1X, signatureY);
    doc.text("Yang Menerima", col2X, signatureY).moveDown(0.5);

    doc.font("Helvetica").text("Pejabat Pembuat Komitmen", col1X, doc.y);
    doc.text("Pengurus Barang", col2X, doc.y).moveDown(3);

    doc.font("Helvetica").text(safeString(data.ppk_nama || ""), col1X, doc.y, {
        underline: true,
    });
    doc.text(safeString(data.pengurus_nama || ""), col2X, doc.y, {
        underline: true,
    });
    doc.moveDown(0.2);

    doc.text(`NIP. ${safeString(data.ppk_nip || "")}`, col1X, doc.y);
    doc.text(
        `NIP. ${safeString(data.pengurus_nip || "")}`,
        col2X,
        doc.y
    ).moveDown(1);

    doc.text(
        `Sumbawa Besar, ${safeString(
            data.tgl || new Date().toLocaleDateString("id-ID")
        )}`,
        { align: "left" }
    );
};

/**
 * 6. Berita Acara Serah Terima Barang (antara PPK dan Rekanan)
 */
const generateBA_SerahTerima_1 = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 6);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "BERITA ACARA SERAH TERIMA BARANG");

    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text("Yang bertandatangan di bawah ini:")
        .moveDown(0.5);

    doc.font("Helvetica").text(`1. Nama  : ${safeString(data.ppk_nama || "")}`);
    doc.text(`   NIP   : ${safeString(data.ppk_nip || "")}`);
    doc.text(`   Selaku: Pejabat Pembuat Komitmen`).moveDown(0.5);

    doc.text(`2. Nama    : ${safeString(data.rekanan_nama || "")}`);
    doc.text(`   Jabatan : ${safeString(data.rekanan_jabatan || "Direktur")}`);
    doc.text(`   Alamat  : ${safeString(data.rekanan_alamat || "")}`).moveDown(
        1
    );

    doc.text(
        "Dengan ini menyatakan telah melakukan serah terima barang dengan rincian sebagai berikut:"
    ).moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Nama Barang",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah Harga",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);

    // Signature
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "left" }
        )
        .moveDown(0.5);

    const signatureY = doc.y;
    const col1X = 50;
    const col2X = 350;

    doc.font("Helvetica-Bold").text("Yang Menyerahkan", col1X, signatureY);
    doc.text("Yang Menerima", col2X, signatureY).moveDown(3);

    doc.font("Helvetica").text(
        safeString(data.rekanan_nama || ""),
        col1X,
        doc.y,
        { underline: true }
    );
    doc.text(safeString(data.ppk_nama || ""), col2X, doc.y, {
        underline: true,
    });
    doc.moveDown(0.2);

    doc.text(safeString(data.rekanan_jabatan || "Direktur"), col1X, doc.y);
    doc.text(`NIP. ${safeString(data.ppk_nip || "")}`, col2X, doc.y);
};

/**
 * 7. Surat Perintah Pengeluaran/Penyaluran Barang
 */
const generateSuratPerintahPengeluaran = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 7);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "SURAT PERINTAH PENGELUARAN/PENYALURAN BARANG");

    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text(`Nomor : ${safeString(data.nomor || "")}`)
        .moveDown(1);

    doc.font("Helvetica").text(`Dari   : Pengguna Anggaran`);
    doc.text(`Kepada : Pengurus Barang`);
    doc.text(
        `Alamat : ${safeString(
            data.alamat || "Jalan Garuda No. 1 Sumbawa Besar"
        )}`
    ).moveDown(1);

    doc.text(
        `Harap dikeluarkan dan disalurkan barang untuk Sub Kegiatan ${safeString(
            data.sub_kegiatan || spj.activityName
        )}`
    ).moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Nama Barang",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah Harga",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);

    // Signature
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl_ttd || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "left" }
        )
        .moveDown(0.5);
    doc.font("Helvetica-Bold").text("Pengguna Anggaran").moveDown(3);
    doc.text(safeString(data.pa_nama || ""), { underline: true });
    doc.text(`NIP. ${safeString(data.pa_nip || "")}`);
};

/**
 * 8. Berita Acara Penerimaan Barang (oleh PA & Pengurus Barang)
 */
const generateBA_Penerimaan = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 8);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "BERITA ACARA PENERIMAAN BARANG");

    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text(`Nomor : ${safeString(data.nomor || "")}`)
        .moveDown(1);

    doc.font("Helvetica")
        .text(
            "Pada hari ini, telah dilakukan penerimaan barang dengan rincian sebagai berikut:"
        )
        .moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Nama Barang",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);

    // Signature
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "left" }
        )
        .moveDown(0.5);
    doc.font("Helvetica-Bold").text("Yang Menerima").moveDown(3);
    doc.text(safeString(data.pengurus_barang_nama || ""), { underline: true });
    doc.text(`NIP. ${safeString(data.pengurus_barang_nip || "")}`);
};

/**
 * 9. Berita Acara Serah Terima Barang (antara Pengurus Barang dan PPTK)
 */
const generateBA_SerahTerima_PPTK = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 9);
    const totalAmount =
        data.items?.reduce(
            (sum: number, item: any) =>
                sum +
                (item.total ||
                    parseFloat(item.harga || 0) * parseFloat(item.volume || 0)),
            0
        ) || 0;

    addHeader(doc, "BERITA ACARA SERAH TERIMA BARANG");

    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text("Yang bertandatangan di bawah ini:")
        .moveDown(0.5);

    doc.font("Helvetica").text(
        `1. Nama  : ${safeString(data.pptk_nama || "")}`
    );
    doc.text(`   NIP   : ${safeString(data.pptk_nip || "")}`);
    doc.text(`   Selaku: Pejabat Pelaksana Teknis Kegiatan (PPTK)`).moveDown(
        0.5
    );

    doc.text(`2. Nama    : ${safeString(data.pengurus_nama || "")}`);
    doc.text(`   Jabatan : Pengurus Barang`);
    doc.text(`   Alamat  : ${safeString(data.pengurus_alamat || "")}`).moveDown(
        1
    );

    doc.text(
        "Dengan ini menyatakan telah melakukan serah terima barang dengan rincian sebagai berikut:"
    ).moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    const itemTable = {
        headers: [
            "No.",
            "Nama Barang",
            "Volume",
            "Satuan",
            "Harga Satuan",
            "Jumlah Harga",
        ],
        rows: [] as string[][],
        widths: [30, 200, 50, 50, 80, 100],
    };

    // Table Data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
            const itemTotal =
                item.total ||
                parseFloat(item.harga || 0) * parseFloat(item.volume || 0);
            itemTable.rows.push([
                (i + 1).toString(),
                safeString(item.nama),
                safeString(item.volume),
                safeString(item.satuan),
                formatNumber(item.harga),
                formatNumber(itemTotal),
            ]);
        });
    }

    // Total Row
    itemTable.rows.push([
        "",
        "JUMLAH",
        "",
        "",
        "",
        formatNumber(data.total || totalAmount),
    ]);

    // Draw Table (Simplified for PDFKit)
    const startX = 30;
    let currentY = tableTop;
    const rowHeight = 20;

    // Draw Headers
    doc.font("Helvetica-Bold").fillColor("black");
    itemTable.headers.forEach((header, i) => {
        const width = itemTable.widths[i];
        doc.rect(
            startX + itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
            currentY,
            width,
            rowHeight
        ).stroke();
        doc.text(
            header,
            startX +
                itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                5,
            currentY + 5,
            { width: width - 10, align: "center" }
        );
    });
    currentY += rowHeight;

    // Draw Rows
    doc.font("Helvetica").fillColor("black");
    itemTable.rows.forEach((row, rowIndex) => {
        row.forEach((cell, i) => {
            const width = itemTable.widths[i];
            doc.rect(
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0),
                currentY,
                width,
                rowHeight
            ).stroke();
            doc.text(
                cell,
                startX +
                    itemTable.widths.slice(0, i).reduce((a, b) => a + b, 0) +
                    5,
                currentY + 5,
                {
                    width: width - 10,
                    align: i === 4 || i === 5 ? "right" : "left",
                }
            );
        });
        currentY += rowHeight;
    });

    doc.moveDown(1);

    // Signature
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "left" }
        )
        .moveDown(0.5);

    const signatureY = doc.y;
    const col1X = 50;
    const col2X = 350;

    doc.font("Helvetica-Bold").text("Yang Menyerahkan", col1X, signatureY);
    doc.text("Yang Menerima", col2X, signatureY).moveDown(3);

    doc.font("Helvetica").text(
        safeString(data.pengurus_nama || ""),
        col1X,
        doc.y,
        { underline: true }
    );
    doc.text(safeString(data.pptk_nama || ""), col2X, doc.y, {
        underline: true,
    });
    doc.moveDown(0.2);

    doc.text(`NIP. ${safeString(data.pengurus_nip || "")}`, col1X, doc.y);
    doc.text(`NIP. ${safeString(data.pptk_nip || "")}`, col2X, doc.y);
};

/**
 * 10. Surat Pernyataan (oleh Pengurus Barang)
 */
const generateSuratPernyataan = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations,
    forms: SpjForm[]
) => {
    const data = getFormData(forms, 10);

    addHeader(doc, "SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK");

    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text("Yang bertandatangan di bawah ini:")
        .moveDown(0.5);

    doc.font("Helvetica").text(`Nama  : ${safeString(data.nama || "")}`);
    doc.text(`NIP   : ${safeString(data.nip || "")}`);
    doc.text(
        `Jabatan: ${safeString(data.jabatan || "Pengurus Barang")}`
    ).moveDown(1);

    doc.text(
        "Dengan ini menyatakan bahwa seluruh barang yang tercantum dalam SPJ ini telah diterima dan dicatat sesuai dengan ketentuan yang berlaku."
    ).moveDown(2);

    // Signature
    doc.font("Helvetica")
        .text(
            `Sumbawa Besar, ${safeString(
                data.tgl_ttd || new Date().toLocaleDateString("id-ID")
            )}`,
            { align: "left" }
        )
        .moveDown(0.5);
    doc.font("Helvetica-Bold").text("Yang Membuat Pernyataan").moveDown(3);
    doc.text(safeString(data.nama || ""), { underline: true });
    doc.text(`NIP. ${safeString(data.nip || "")}`);
};

/**
 * 11. Lembar Verifikasi (oleh PPK Keuangan)
 */
const generateLembarVerifikasi = (
    doc: PDFKit.PDFDocument,
    spj: SpjWithRelations
) => {
    const verification = spj.verification;

    addHeader(doc, "LEMBAR VERIFIKASI SPJ");

    doc.fontSize(10).font("Helvetica");
    doc.text(`ID RUP: ${safeString(spj.rupId)}`).moveDown(0.2);
    doc.text(`Kegiatan: ${safeString(spj.activityName)}`).moveDown(1);

    doc.font("Helvetica-Bold").text("Hasil Verifikasi:").moveDown(0.5);

    doc.font("Helvetica")
        .text(`Status Akhir: ${safeString(spj.status)}`)
        .moveDown(0.2);
    doc.text(
        `Catatan Verifikator: ${safeString(verification?.notes || "-")}`
    ).moveDown(0.2);
    doc.text(
        `Catatan Finalisasi: ${safeString(verification?.finalNotes || "-")}`
    ).moveDown(1);

    const signatureY = doc.y;
    const col1X = 50;
    const col2X = 350;

    doc.font("Helvetica-Bold").text("Verifikator", col1X, signatureY);
    doc.text("Finalisator", col2X, signatureY).moveDown(3);

    doc.font("Helvetica").text(
        safeString(verification?.validator?.name || ""),
        col1X,
        doc.y,
        { underline: true }
    );
    doc.text(safeString(verification?.verifier?.name || ""), col2X, doc.y, {
        underline: true,
    });
    doc.moveDown(0.2);

    // NOTE: NIP tidak ada di tipe User, asumsikan ada di data tambahan atau kita skip dulu
    doc.text(
        `NIP. ${safeString((verification?.validator as any)?.nip || "")}`,
        col1X,
        doc.y
    );
    doc.text(
        `NIP. ${safeString((verification?.verifier as any)?.nip || "")}`,
        col2X,
        doc.y
    );
};

// --- Main Generator Function ---

/**
 * Generate PDF for a single form (for draft download)
 */
export const generateSingleFormPDF = async (
    formType: number,
    formData: any,
    spjMetadata: SpjMetadata
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 30,
            bufferPages: true,
        });
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on("error", reject);

        // Create a mock SpjWithRelations object for the single form generation functions
        const mockSpj: SpjWithRelations = {
            ...spjMetadata,
            id: "mock",
            operatorId: "mock",
            createdAt: new Date(),
            updatedAt: new Date(),
            forms: [
                {
                    formType,
                    data: formData,
                    id: "mock",
                    spjId: "mock",
                    status: "filled",
                    physicalSignatureScanUrl: null,
                    physicalSignatureFileType: null,
                    notes: null,
                },
            ],
            operator: {
                id: "mock",
                name: "Mock Operator",
                email: "mock@example.com",
                role: "OPERATOR",
                password: "mock",
                nip: "123456789012345678",
            },
        } as any;

        switch (formType) {
            case 1:
                generateSPB(doc, mockSpj, mockSpj.forms);
                break;
            case 2:
                generateBuktiPembelian(doc, mockSpj, mockSpj.forms);
                break;
            case 3:
                generateKwitansi(doc, mockSpj, mockSpj.forms);
                break;
            case 4:
                generatePermohonanSerahTerima(doc, mockSpj, mockSpj.forms);
                break;
            case 5:
                generatePenyerahanBarang(doc, mockSpj, mockSpj.forms);
                break;
            case 6:
                generateBA_SerahTerima_1(doc, mockSpj, mockSpj.forms);
                break;
            case 7:
                generateSuratPerintahPengeluaran(doc, mockSpj, mockSpj.forms);
                break;
            case 8:
                generateBA_Penerimaan(doc, mockSpj, mockSpj.forms);
                break;
            case 9:
                generateBA_SerahTerima_PPTK(doc, mockSpj, mockSpj.forms);
                break;
            case 10:
                generateSuratPernyataan(doc, mockSpj, mockSpj.forms);
                break;
            case 11:
                generateLembarVerifikasi(doc, mockSpj);
                break;
            default:
                reject(
                    new Error(
                        `Form type ${formType} not supported for single PDF download.`
                    )
                );
                return;
        }

        doc.end();
    });
};

/**
 * Generate PDF for all 11 forms (for final download)
 */
export const generateSpjPDF = async (
    spj: SpjWithRelations
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 30,
            bufferPages: true,
        });
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on("error", reject);

        for (let formType = 1; formType <= 11; formType++) {
            if (formType > 1) {
                doc.addPage();
            }

            switch (formType) {
                case 1:
                    generateSPB(doc, spj, spj.forms);
                    break;
                case 2:
                    generateBuktiPembelian(doc, spj, spj.forms);
                    break;
                case 3:
                    generateKwitansi(doc, spj, spj.forms);
                    break;
                case 4:
                    generatePermohonanSerahTerima(doc, spj, spj.forms);
                    break;
                case 5:
                    generatePenyerahanBarang(doc, spj, spj.forms);
                    break;
                case 6:
                    generateBA_SerahTerima_1(doc, spj, spj.forms);
                    break;
                case 7:
                    generateSuratPerintahPengeluaran(doc, spj, spj.forms);
                    break;
                case 8:
                    generateBA_Penerimaan(doc, spj, spj.forms);
                    break;
                case 9:
                    generateBA_SerahTerima_PPTK(doc, spj, spj.forms);
                    break;
                case 10:
                    generateSuratPernyataan(doc, spj, spj.forms);
                    break;
                case 11:
                    generateLembarVerifikasi(doc, spj);
                    break;
                default:
                    doc.fontSize(14).text(`Form ${formType}: Tidak Dikenal`, {
                        align: "center",
                    });
                    doc.moveDown(1);
                    doc.fontSize(10).text(
                        "Form ini tidak termasuk dalam 11 form SPJ yang didefinisikan."
                    );
                    break;
            }
        }

        doc.end();
    });
};
