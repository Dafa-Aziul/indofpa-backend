import { success } from "../utils/response.js";

import {
  getAnalisisService,
  updateAnalisisConfigService,
  getAnalisisKuesionerListService
} from "../services/analisisService.js";


// ===============================
// GET LIST — Kuesioner siap analisis
// ===============================
export const getAnalisisKuesionerList = async (req, res, next) => {
  try {
    const { search, kategori, page = 1, limit = 10 } = req.query;

    const result = await getAnalisisKuesionerListService({
      search,
      kategori,
      page: Number(page),
      limit: Number(limit)
    });

    return success(res, "Berhasil mengambil daftar kuesioner untuk analisis", result.items , result.meta);

  } catch (err) {
    next(err);
  }
};

// ===============================
// GET ANALISIS — detail analisis kuesioner
// ===============================
export const getAnalisis = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const data = await getAnalisisService(kuesionerId);

    return success(res, "Berhasil mengambil analisis kuesioner", data);

  } catch (err) {
    next(err);
  }
};


// ===============================
// UPDATE ANALISIS CONFIG (range interpretasi skor)
// ===============================
export const updateAnalisisConfig = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;
    const config = req.body;

    const updated = await updateAnalisisConfigService(kuesionerId, config);

    return success(res, "Konfigurasi analisis berhasil diperbarui", updated);

  } catch (err) {
    next(err);
  }
};
