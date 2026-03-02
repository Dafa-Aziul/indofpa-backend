import ApiError from "../../utils/apiError.js";

//   DEFINISI HEADER WAJIB
export const REQUIRED_HEADERS = {
    Kuesioner: [
        "judul",
        "kategori",
        "tujuan",
        "manfaat",
        "estimasi_menit",
        "target_responden",
    ],
    Variabel: ["kode_variabel", "nama_variabel", "deskripsi"],
    Indikator: ["kode_variabel", "kode_indikator", "nama_indikator"],
    Skala: ["kode_skala", "nilai", "label"],
    Pertanyaan: ["kode_indikator", "urutan", "teks_pertanyaan", "kode_skala"],
};

//      VALIDATOR HEADER
export const validateHeaders = (sheet, sheetName) => {
    const expected = REQUIRED_HEADERS[sheetName].map((h) => h.toLowerCase());
    const row = sheet.getRow(1);

    const found = row.values
        .slice(1)
        .map((v) => String(v || "").trim().toLowerCase());

    if (found.length !== expected.length) {
        throw new ApiError(
            400,
            `Sheet '${sheetName}' memiliki ${found.length} kolom, ` +
            `seharusnya ${expected.length} kolom.`
        );
    }

    for (let i = 0; i < expected.length; i++) {
        if (found[i] !== expected[i]) {
            throw new ApiError(
                400,
                `Header sheet '${sheetName}' salah di kolom ${i + 1}: ` +
                `Expected '${expected[i]}', found '${found[i] || "(kosong)"}'.`
            );
        }
    }
};


//   VALIDATOR ROW — VARIABEL
export const validateVariabelRows = (sheet) => {
    const seenKode = new Set();

    sheet.eachRow((row, idx) => {
        if (idx === 1) return;
        if (rowHasNoData(row)) return; // skip baris kosong

        const kode = getCell(row, 1);
        const nama = getCell(row, 2);

        if (!kode) throw new ApiError(400, `Variabel baris ${idx}: 'kode_variabel' wajib.`);
        if (!nama) throw new ApiError(400, `Variabel baris ${idx}: 'nama_variabel' wajib.`);

        if (seenKode.has(kode)) {
            throw new ApiError(400, `Variabel baris ${idx}: kode '${kode}' duplikat.`);
        }
        seenKode.add(kode);
    });
};

//   VALIDATOR ROW — INDIKATOR
export const validateIndikatorRows = (sheet, variabelMap) => {
    const seenKode = new Set();

    sheet.eachRow((row, idx) => {
        if (idx === 1) return;
        if (rowHasNoData(row)) return;

        const kodeVariabel = getCell(row, 1);
        const kodeInd = getCell(row, 2);
        const namaInd = getCell(row, 3);

        if (!kodeVariabel)
            throw new ApiError(400, `Indikator baris ${idx}: 'kode_variabel' wajib.`);
        if (!variabelMap[kodeVariabel])
            throw new ApiError(400, `Indikator baris ${idx}: Variabel '${kodeVariabel}' tidak ditemukan.`);

        if (!kodeInd)
            throw new ApiError(400, `Indikator baris ${idx}: 'kode_indikator' wajib.`);
        if (seenKode.has(kodeInd))
            throw new ApiError(400, `Indikator baris ${idx}: kode '${kodeInd}' duplikat.`);

        if (!namaInd)
            throw new ApiError(400, `Indikator baris ${idx}: 'nama_indikator' wajib.`);

        seenKode.add(kodeInd);
    });
};

//   VALIDATOR ROW — SKALA
export const validateSkalaRows = (sheet) => {
    const seen = {};

    sheet.eachRow((row, idx) => {
        if (idx === 1) return;
        if (rowHasNoData(row)) return;

        const kode = getCell(row, 1);
        const nilai = row.getCell(2).value;
        const label = getCell(row, 3);

        if (!kode) throw new ApiError(400, `Skala baris ${idx}: 'kode_skala' wajib.`);
        if (!nilai) throw new ApiError(400, `Skala baris ${idx}: 'nilai' wajib.`);
        if (!label) throw new ApiError(400, `Skala baris ${idx}: 'label' wajib.`);

        if (!seen[kode]) seen[kode] = new Set();
        if (seen[kode].has(nilai)) {
            throw new ApiError(
                400,
                `Skala baris ${idx}: nilai '${nilai}' duplikat pada skala '${kode}'.`
            );
        }
        seen[kode].add(nilai);
    });
};

//   VALIDATOR ROW — PERTANYAAN
export const validatePertanyaanRows = (sheet, indikatorMap, skalaMap) => {
    sheet.eachRow((row, idx) => {
        if (idx === 1) return;
        if (rowHasNoData(row)) return;

        const kodeInd = getCell(row, 1);
        const urutan = row.getCell(2).value;
        const teks = getCell(row, 3);
        const kodeSkala = getCell(row, 4);

        if (!kodeInd)
            throw new ApiError(400, `Pertanyaan baris ${idx}: 'kode_indikator' wajib.`);
        if (!indikatorMap[kodeInd])
            throw new ApiError(400, `Pertanyaan baris ${idx}: indikator '${kodeInd}' tidak ditemukan.`);

        if (!urutan || isNaN(Number(urutan)))
            throw new ApiError(400, `Pertanyaan baris ${idx}: 'urutan' harus angka.`);

        if (!teks)
            throw new ApiError(400, `Pertanyaan baris ${idx}: 'teks_pertanyaan' wajib.`);

        if (!kodeSkala)
            throw new ApiError(400, `Pertanyaan baris ${idx}: 'kode_skala' wajib.`);

        if (!skalaMap[kodeSkala])
            throw new ApiError(400, `Pertanyaan baris ${idx}: skala '${kodeSkala}' tidak ditemukan.`);
    });
};

//   UTILITAS PEMBANTU
const getCell = (row, colIndex) =>
    String(row.getCell(colIndex).value || "").trim();

const rowHasNoData = (row) =>
    row.values.slice(1).every((v) => v === null || v === undefined || v === "");