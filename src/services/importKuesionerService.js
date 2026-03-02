import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import ExcelJS from "exceljs";

import {
  validateHeaders,
  validateVariabelRows,
  validateIndikatorRows,
  validateSkalaRows,
  validatePertanyaanRows,
  REQUIRED_HEADERS,
} from "../middlewares/validators/HeaderRowValidator.js";


export const importKuesionerService = async (filePath, userId) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheetKuesioner = workbook.getWorksheet("Kuesioner");
  const sheetVariabel = workbook.getWorksheet("Variabel");
  const sheetIndikator = workbook.getWorksheet("Indikator");
  const sheetSkala = workbook.getWorksheet("Skala");
  const sheetPertanyaan = workbook.getWorksheet("Pertanyaan");

  // 1. CEK SHEET WAJIB
  const requiredSheets = { sheetKuesioner, sheetVariabel, sheetIndikator, sheetSkala, sheetPertanyaan };
  for (const key in requiredSheets) {
    if (!requiredSheets[key]) {
      throw new ApiError(400, `Sheet '${key.replace("sheet", "")}' tidak ditemukan.`);
    }
  }

  // 2. VALIDASI HEADER
  validateHeaders(sheetKuesioner, "Kuesioner");
  validateHeaders(sheetVariabel, "Variabel");
  validateHeaders(sheetIndikator, "Indikator");
  validateHeaders(sheetSkala, "Skala");
  validateHeaders(sheetPertanyaan, "Pertanyaan");


  // 3. EXTRACT SHEET RECORDS → ARRAY (TIDAK INSERT DULU)
  const variabelRows = [];
  const indikatorRows = [];
  const skalaRows = [];
  const pertanyaanRows = [];

  sheetVariabel.eachRow((row, idx) => {
    if (idx === 1) return;
    variabelRows.push({
      kode: getCell(row, 1),
      nama: getCell(row, 2),
      deskripsi: row.getCell(3).value || null,
    });
  });

  sheetIndikator.eachRow((row, idx) => {
    if (idx === 1) return;
    indikatorRows.push({
      kodeVariabel: getCell(row, 1),
      kodeIndikator: getCell(row, 2),
      nama: getCell(row, 3),
    });
  });

  sheetSkala.eachRow((row, idx) => {
    if (idx === 1) return;
    skalaRows.push({
      kode: getCell(row, 1),
      nilai: Number(row.getCell(2).value),
      label: getCell(row, 3),
    });
  });

  sheetPertanyaan.eachRow((row, idx) => {
    if (idx === 1) return;
    pertanyaanRows.push({
      kodeIndikator: getCell(row, 1),
      urutan: Number(row.getCell(2).value),
      teks: getCell(row, 3),
      kodeSkala: getCell(row, 4),
    });
  });


  // 4. BANGUN MAP UNTUK VALIDASI
  const variabelMap = {};
  const indikatorMap = {};
  const skalaMap = {};

  variabelRows.forEach(v => variabelMap[v.kode] = true);
  indikatorRows.forEach(i => indikatorMap[i.kodeIndikator] = true);
  skalaRows.forEach(s => {
    if (!skalaMap[s.kode]) skalaMap[s.kode] = {};
    skalaMap[s.kode][s.nilai] = s.label;
  });

  // 5. VALIDASI ROW MENGGUNAKAN MAP
  validateVariabelRows(sheetVariabel);
  validateIndikatorRows(sheetIndikator, variabelMap);
  validateSkalaRows(sheetSkala);
  validatePertanyaanRows(sheetPertanyaan, indikatorMap, skalaMap);


  // 6. TRANSASKI INSERT BERURUTAN
  return prisma.$transaction(async (tx) => {
    // Insert Kuesioner
    const kuesRow = sheetKuesioner.getRow(2);
    const judul = getCell(kuesRow, 1);
    const kategoriNama = getCell(kuesRow, 2);

    const kategori = await tx.kategori.findFirst({
      where: { nama: kategoriNama },
    });

    if (!kategori) {
      throw new ApiError(400, `Kategori '${kategoriNama}' tidak ditemukan.`);
    }

    const kuesioner = await tx.kuesioner.create({
      data: {
        judul,
        kategoriId: kategori.kategoriId,
        tujuan: kuesRow.getCell(3).value || null,
        manfaat: kuesRow.getCell(4).value || null,
        estimasiMenit: Number(kuesRow.getCell(5).value) || 0,
        targetResponden: Number(kuesRow.getCell(6).value) || 0,
        pembuatId: userId,
      },
    });

    // Insert Variabel
    const variabelIdMap = {};
    for (const v of variabelRows) {
      const vr = await tx.variabel.create({
        data: {
          kuesionerId: kuesioner.kuesionerId,
          kode: v.kode,
          nama: v.nama,
          deskripsi: v.deskripsi,
        },
      });
      variabelIdMap[v.kode] = vr.variabelId;
    }

    // Insert Indikator
    const indikatorIdMap = {};
    for (const i of indikatorRows) {
      const ind = await tx.indikator.create({
        data: {
          variabelId: variabelIdMap[i.kodeVariabel],
          kode: i.kodeIndikator,
          nama: i.nama,
        },
      });
      indikatorIdMap[i.kodeIndikator] = ind.indikatorId;
    }

    // Insert Pertanyaan
    for (const p of pertanyaanRows) {
      await tx.pertanyaan.create({
        data: {
          indikatorId: indikatorIdMap[p.kodeIndikator],
          teksPertanyaan: p.teks,
          urutan: p.urutan,
          labelSkala: skalaMap[p.kodeSkala],
        },
      });
    }

    return {
      message: "Import kuesioner berhasil",
      kuesionerId: kuesioner.kuesionerId,
    };
  });
};


// Helper
const getCell = (row, col) =>
  String(row.getCell(col).value || "").trim();