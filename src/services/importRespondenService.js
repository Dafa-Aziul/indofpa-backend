import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import ExcelJS from "exceljs";

// Fungsi untuk mengambil string dari cell dengan berbagai kemungkinan format
function getCellString(cell) {
    if (!cell || cell.value === null || cell.value === undefined) return "";

    const v = cell.value;

    if (v?.richText) return v.richText.map(t => t.text).join("").trim();
    if (v?.text) return v.text.trim(); // hyperlink
    if (v?.result !== undefined) return String(v.result ?? "").trim();

    if (typeof v === "string") return v.trim();
    if (typeof v === "number") return String(v);
    if (typeof v === "boolean") return v ? "true" : "false";

    if (typeof v === "object") {
        return (v.text ?? v.toString() ?? "").trim();
    }

    return String(v ?? "").trim();
}

// Mapping untuk kategori responden
const mapUsia = {
    "18-24": "USIA_18_24",
    "25-34": "USIA_25_34",
    "35-44": "USIA_35_44",
    "45-54": "USIA_45_54",
    "55-64": "USIA_55_64",
    "65+": "USIA_65_PLUS",
};

const mapJenis = { L: "L", P: "P" };

const mapPendidikan = {
    "Tidak tamat SD": "TidakTamatSD",
    SD: "SD",
    SMP: "SMP",
    SMA: "SMA",
    Diploma: "Diploma",
    S1: "S1",
    S2: "S2",
    S3: "S3",
};

const mapAgama = {
    Islam: "Islam",
    "Kristen Protestan": "KristenProtestan",
    Katolik: "Katolik",
    Hindu: "Hindu",
    Buddha: "Buddha",
    Konghucu: "Konghucu",
    Kepercayaan: "Kepercayaan",
};

//   MAIN IMPORT KUESIONER (FINAL)
async function hitungSkorResponden(tx, respondenId, kuesionerId) {
    const indikatorList = await tx.indikator.findMany({
        where: { variabel: { kuesionerId: Number(kuesionerId) } },
        include: { pertanyaan: true }
    });

    for (const ind of indikatorList) {
        const pertanyaanIds = ind.pertanyaan.map(p => p.pertanyaanId);
        if (pertanyaanIds.length === 0) continue;

        const jawaban = await tx.jawaban.findMany({
            where: { respondenId, pertanyaanId: { in: pertanyaanIds } }
        });

        if (!jawaban.length) continue;

        // Hitung nilai RAW
        const nilaiList = jawaban.map(j => j.nilai);
        const raw = nilaiList.reduce((s, x) => s + x, 0) / nilaiList.length;

        // Ambil max scale
        const contoh = ind.pertanyaan[0];
        const keys = Object.keys(contoh.labelSkala || {}).map(Number);
        const maxScale = Math.max(...keys);

        const pembagi = maxScale - 1 > 0 ? (maxScale - 1) : 1;
        const norm = ((raw - 1) / pembagi) * 100;

        await tx.respondenScore.create({
            data: {
                respondenId,
                kuesionerId,
                indikatorId: ind.indikatorId,
                scoreRaw: raw,
                scoreNormalized: norm,
            }
        });
    }

    await tx.respondenProfile.update({
        where: { respondenId },
        data: { waktuSelesai: new Date() }
    });
}

// MAIN SERVICE
export const importRespondenService = async (filePath, kuesionerId) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheetResponden = workbook.getWorksheet("Responden");
    const sheetJawaban = workbook.getWorksheet("Jawaban");

    if (!sheetResponden || !sheetJawaban)
        throw new ApiError(400, "Sheet 'Responden' dan 'Jawaban' wajib ada.");

    // Ambil pertanyaan berdasarkan urutan
    const pertanyaanList = await prisma.pertanyaan.findMany({
        where: { indikator: { variabel: { kuesionerId: Number(kuesionerId) } } },
        orderBy: { urutan: "asc" }
    });

    if (!pertanyaanList.length)
        throw new ApiError(400, "Tidak ada pertanyaan pada kuesioner ini.");

    const pertanyaanMap = {};
    pertanyaanList.forEach((p, idx) => (pertanyaanMap[idx + 1] = p));

    return await prisma.$transaction(async (tx) => {
        const respondenMap = {};

        // STEP 1 — IMPORT RESPONDEN
        const rows = sheetResponden.getRows(2, sheetResponden.rowCount - 1) || [];

        for (const row of rows) {
            const email = getCellString(row.getCell(1));
            const nama = getCellString(row.getCell(2));

            const usiaKategori = mapUsia[getCellString(row.getCell(3))];
            const jenisKelamin = mapJenis[getCellString(row.getCell(4))];
            const tingkatPendidikan = mapPendidikan[getCellString(row.getCell(5))];
            const agama = mapAgama[getCellString(row.getCell(6))];
            const pekerjaan = getCellString(row.getCell(7)) || null;

            if (!email) throw new ApiError(400, `Email wajib (baris ${row.number})`);
            if (!usiaKategori) throw new ApiError(400, `Usia tidak valid (baris ${row.number})`);
            if (!jenisKelamin) throw new ApiError(400, `Jenis kelamin tidak valid (baris ${row.number})`);
            if (!tingkatPendidikan) throw new ApiError(400, `Tingkat pendidikan tidak valid (baris ${row.number})`);
            if (!agama) throw new ApiError(400, `Agama tidak valid (baris ${row.number})`);

            try {
                const r = await tx.respondenProfile.create({
                    data: {
                        email,
                        nama,
                        kuesionerId: Number(kuesionerId),
                        usiaKategori,
                        jenisKelamin,
                        tingkatPendidikan,
                        agama,
                        pekerjaan,
                        waktuMulai: new Date(),
                    },
                });

                respondenMap[email] = r;

            } catch (err) {
                if (err.code === "P2002") {
                    throw new ApiError(409, `Email '${email}' sudah pernah mengisi kuesioner ini`);
                }
                throw err;
            }
        }

        //  STEP 2 — VALIDASI HEADER
        const headerRow = sheetJawaban.getRow(1);
        const headerUrutanList = [];
        const headerColMap = {}; // urutan → col index

        headerRow.eachCell((cell, col) => {
            if (col === 1) return;

            const header = getCellString(cell);
            const match = /^no_(\d+)$/i.exec(header);

            if (!match)
                throw new ApiError(400, `Header '${header}' tidak valid. Gunakan no_1, no_2, dst.`);

            const urutan = Number(match[1]);
            headerUrutanList.push(urutan);
            headerColMap[urutan] = col;
        });

        if (headerUrutanList.length !== pertanyaanList.length)
            throw new ApiError(400, `Kolom jawaban tidak sesuai jumlah pertanyaan.`);

        if (Math.max(...headerUrutanList) !== pertanyaanList.length)
            throw new ApiError(400, `Urutan kolom harus 1 sampai ${pertanyaanList.length}`);

        // STEP 3 — VALIDASI & SIMPAN JAWABAN
        const jawabanRows = sheetJawaban.getRows(2, sheetJawaban.rowCount - 1);

        for (const row of jawabanRows) {
            const email = getCellString(row.getCell(1));
            if (!email) continue;

            const responden = respondenMap[email];
            if (!responden)
                throw new ApiError(400, `Email '${email}' tidak ditemukan di sheet Responden.`);

            const respondenId = responden.respondenId;

            for (const urutan of headerUrutanList) {
                const col = headerColMap[urutan];
                const nilai = Number(row.getCell(col).value);

                if (isNaN(nilai))
                    throw new ApiError(400, `Nilai no_${urutan} pada baris ${row.number} harus angka`);

                const p = pertanyaanMap[urutan];
                const keys = Object.keys(p.labelSkala || {}).map(Number);
                const maxScale = Math.max(...keys) || 5;

                if (nilai < 1 || nilai > maxScale)
                    throw new ApiError(400, `Nilai no_${urutan} harus 1-${maxScale} (baris ${row.number})`);

                await tx.jawaban.create({
                    data: {
                        respondenId,
                        pertanyaanId: p.pertanyaanId,
                        nilai,
                    }
                });
            }

            // Hitung skor
            await hitungSkorResponden(tx, respondenId, kuesionerId);
        }

        return {
            message: "Import responden & jawaban berhasil",
            responden: Object.keys(respondenMap).length,
            pertanyaan: pertanyaanList.length,
            jawaban: sheetJawaban.rowCount - 1,
        };
    });
};