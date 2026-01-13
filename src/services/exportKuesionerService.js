import ExcelJS from "exceljs";
import prisma from "../config/prisma.js";

// Import utilitas style (Pastikan file excelStyle.js tersedia di folder utils)
import {
  headerStyle,
  styleRow,
  applyBorder,
  autosizeColumns
} from "../utils/excelStyle.js";

/**
 * HELPER: Konversi Enum Database ke Teks Bahasa Indonesia Formal
 */
const formatUsia = (val) => {
  const map = {
    USIA_18_24: "18-24 Tahun",
    USIA_25_34: "25-34 Tahun",
    USIA_35_44: "35-44 Tahun",
    USIA_45_54: "45-54 Tahun",
    USIA_55_64: "55-64 Tahun",
    USIA_65_PLUS: "65+ Tahun"
  };
  return map[val] || val;
};

const formatGender = (val) => {
  return val === "L" ? "Laki-laki" : val === "P" ? "Perempuan" : val;
};

const formatPendidikan = (val) => {
  const map = {
    TidakTamatSD: "Tidak tamat SD",
    SD: "SD",
    SMP: "SMP",
    SMA: "SMA",
    Diploma: "Diploma",
    S1: "S1",
    S2: "S2",
    S3: "S3"
  };
  return map[val] || val;
};

const formatAgama = (val) => {
  const map = {
    KristenProtestan: "Kristen Protestan",
    Islam: "Islam",
    Katolik: "Katolik",
    Hindu: "Hindu",
    Buddha: "Buddha",
    Konghucu: "Konghucu",
    Kepercayaan: "Kepercayaan"
  };
  return map[val] || val;
};

export const generateKuesionerExcelService = async (kuesionerId) => {
  const id = Number(kuesionerId);

  // 1. Ambil data lengkap berdasarkan relasi schema.prisma
  const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id },
    include: {
      kategori: true,
      variabel: {
        include: {
          indikator: {
            orderBy: { indikatorId: "asc" },
            include: { pertanyaan: { orderBy: { urutan: "asc" } } }
          }
        }
      },
      responden: {
        include: { jawaban: true }
      }
    }
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IndoFPA System";

  // ==========================================
  // SHEET 1: RINGKASAN UMUM
  // ==========================================
  const s1 = workbook.addWorksheet("1. Ringkasan Umum");
  s1.addRow(["IDENTITAS KUESIONER"]).font = { bold: true, size: 14 };
  s1.addRow([]);

  const summaryRows = [
    ["Judul", kuesioner.judul],
    ["Kategori", kuesioner.kategori.nama],
    ["Status", kuesioner.status],
    ["Tujuan", kuesioner.tujuan || "-"],
    ["Manfaat", kuesioner.manfaat || "-"],
    ["Total Responden", kuesioner.responden.length],
    ["Tanggal Cetak", new Date().toLocaleString("id-ID")]
  ];

  summaryRows.forEach(item => {
    const row = s1.addRow(item);
    row.getCell(1).font = { bold: true };
    applyBorder(row);
  });
  autosizeColumns(s1);

  // ==========================================
  // SHEET 2: STRUKTUR INSTRUMEN (3 TABEL)
  // ==========================================
  const s2 = workbook.addWorksheet("2. Struktur Instrumen");

  // --- TABEL A: DAFTAR VARIABEL ---
  s2.addRow(["TABEL A: DAFTAR VARIABEL"]).font = { bold: true, size: 12 };
  const hA = s2.addRow(["No", "Kode Var", "Nama Variabel", "Deskripsi Variabel"]);
  styleRow(hA, headerStyle);

  kuesioner.variabel.forEach((v, idx) => {
    const row = s2.addRow([idx + 1, v.kode, v.nama, v.deskripsi || "-"]);
    applyBorder(row);
    row.getCell(4).alignment = { wrapText: true, vertical: 'middle' };
  });

  s2.addRow([]); s2.addRow([]);

  // --- TABEL B: DAFTAR INDIKATOR (MERGE VARIABEL PARENT) ---
  s2.addRow(["TABEL B: DAFTAR INDIKATOR"]).font = { bold: true, size: 12 };
  const hB = s2.addRow(["No", "Variabel (Parent)", "Kode Ind", "Nama Indikator"]);
  styleRow(hB, headerStyle);

  let indIdx = 1;
  kuesioner.variabel.forEach(v => {
    const startRow = s2.lastRow.number + 1;
    v.indikator.forEach(ind => {
      const varDisplayName = `[${v.kode}] ${v.nama}`;
      const row = s2.addRow([indIdx++, varDisplayName, ind.kode, ind.nama]);
      applyBorder(row);
    });
    const endRow = s2.lastRow.number;
    if (startRow <= endRow) {
      s2.mergeCells(`B${startRow}:B${endRow}`);
      s2.getCell(`B${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
  });

  s2.addRow([]); s2.addRow([]);

  // --- TABEL C: DAFTAR PERTANYAAN (MERGE INDIKATOR PARENT) ---
  s2.addRow(["TABEL C: DAFTAR PERTANYAAN"]).font = { bold: true, size: 12 };
  const hC = s2.addRow(["No", "Indikator (Parent)", "Teks Pertanyaan", "Urutan"]);
  styleRow(hC, headerStyle);

  let qIdx = 1;
  kuesioner.variabel.forEach(v => {
    v.indikator.forEach(ind => {
      const startRow = s2.lastRow.number + 1;
      ind.pertanyaan.forEach(p => {
        const row = s2.addRow([qIdx++, `[${ind.kode}] ${ind.nama}`, p.teksPertanyaan, p.urutan]);
        applyBorder(row);
      });
      const endRow = s2.lastRow.number;
      if (startRow <= endRow) {
        s2.mergeCells(`B${startRow}:B${endRow}`);
        s2.getCell(`B${startRow}`).alignment = { vertical: 'middle', wrapText: true };
      }
    });
  });

  s2.getColumn(3).width = 30;
  s2.getColumn(4).width = 45;
  s2.getColumn(2).width = 35;
  s2.getColumn(3).width = 75;
  autosizeColumns(s2);

  // ==========================================
  // SHEET 3: PROFIL RESPONDEN
  // ==========================================
  const s3 = workbook.addWorksheet("3. Profil Responden");
  const h3 = s3.addRow(["No", "Nama", "Email", "Usia", "Gender", "Pendidikan", "Agama", "Pekerjaan"]);
  styleRow(h3, headerStyle);

  kuesioner.responden.forEach((r, idx) => {
    const row = s3.addRow([
      idx + 1,
      r.nama || "Anonim",
      r.email || "-",
      formatUsia(r.usiaKategori),
      formatGender(r.jenisKelamin),
      formatPendidikan(r.tingkatPendidikan),
      formatAgama(r.agama),
      r.pekerjaan || "-"
    ]);
    applyBorder(row);
  });
  autosizeColumns(s3);

  // ==========================================
  // SHEET 4: JAWABAN RESPONDEN (MATRIKS)
  // ==========================================
  const s4 = workbook.addWorksheet("4. Jawaban Responden");
  const qFlattened = [];
  kuesioner.variabel.forEach(v => v.indikator.forEach(ind => ind.pertanyaan.forEach(p => qFlattened.push({ id: p.pertanyaanId, code: ind.kode }))));

  const h4 = s4.addRow(["No", "Responden", ...qFlattened.map((q, i) => `${q.code}-${i + 1}`)]);
  styleRow(h4, headerStyle);

  kuesioner.responden.forEach((r, idx) => {
    const rowData = [idx + 1, r.nama || "Anonim"];
    qFlattened.forEach(q => {
      const j = r.jawaban.find(ans => ans.pertanyaanId === q.id);
      rowData.push(j ? j.nilai : 0);
    });
    const row = s4.addRow(rowData);
    applyBorder(row);
  });
  s4.views = [{ state: 'frozen', xSplit: 2, ySplit: 1 }];
  autosizeColumns(s4);

  return {
    workbook,
    title: kuesioner.judul
  };
};