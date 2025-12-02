import ExcelJS from "exceljs";
import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

// 🎨 IMPORT STYLE
import {
  headerStyle,
  cellBorder,
  styleRow,
  applyBorder,
  autosizeColumns
} from "../utils/excelStyle.js";

export const generateKuesionerExcelService = async (kuesionerId) => {
  const id = Number(kuesionerId);

  const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id },
    include: {
      kategori: true,
      indikator: {
        orderBy: { indikatorId: "asc" },
        include: { pertanyaan: { orderBy: { urutan: "asc" } } },
      },
      responden: true,
    },
  });

  const workbook = new ExcelJS.Workbook();

  // ======================
  // SHEET 1 — DETAIL
  // ======================
  const s1 = workbook.addWorksheet("Detail Kuesioner");
  s1.addRow(["Judul", kuesioner.judul]);
  s1.addRow(["Kategori", kuesioner.kategori.nama]);
  s1.addRow(["Status", kuesioner.status]);
  s1.addRow(["Tujuan", kuesioner.tujuan || "-"]);
  s1.addRow(["Manfaat", kuesioner.manfaat || "-"]);
  autosizeColumns(s1);

  // ======================
  // SHEET 2 — INDIKATOR & PERTANYAAN
  // ======================
  const s2 = workbook.addWorksheet("Indikator & Pertanyaan");

  // Header indikator
  const h1 = s2.addRow(["No", "Kode", "Nama"]);
  styleRow(h1, headerStyle);

  kuesioner.indikator.forEach((i, idx) => {
    const row = s2.addRow([idx + 1, i.kode, i.nama]);
    applyBorder(row);
  });

  s2.addRow([]);
  const h2 = s2.addRow(["No", "Indikator", "Pertanyaan", "Urutan", "Label Skala"]);
  styleRow(h2, headerStyle);

  let no = 1;
  kuesioner.indikator.forEach((ind) => {
    ind.pertanyaan.forEach((p) => {
      const row = s2.addRow([
        no++,
        ind.nama,
        p.teksPertanyaan,
        p.urutan,
        p.labelSkala ? JSON.stringify(p.labelSkala) : "-",
      ]);
      applyBorder(row);
    });
  });

  autosizeColumns(s2);

  // ======================
  // SHEET 3 — RESPONDEN
  // ======================
  const s3 = workbook.addWorksheet("Responden");
  const header3 = [
    "No",
    "Nama",
    "Email",
    "Usia",
    "Jenis Kelamin",
    "Pendidikan",
    "Agama",
    "Pekerjaan",
    "Waktu Mulai",
    "Waktu Selesai",
    "Durasi (detik)",
  ];
  const h3 = s3.addRow(header3);
  styleRow(h3, headerStyle);

  kuesioner.responden.forEach((r, idx) => {
    const durasi =
      r.waktuMulai && r.waktuSelesai
        ? Math.round((new Date(r.waktuSelesai) - new Date(r.waktuMulai)) / 1000)
        : null;

    const row = s3.addRow([
      idx + 1,
      r.nama,
      r.email,
      r.usiaKategori,
      r.jenisKelamin,
      r.tingkatPendidikan,
      r.agama,
      r.pekerjaan || "-",
      r.waktuMulai,
      r.waktuSelesai,
      durasi,
    ]);
    applyBorder(row);
  });

  autosizeColumns(s3);

  return workbook;
};
