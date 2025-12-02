import { success } from "../utils/response.js";
import {
  getPertanyaanService,
  createPertanyaanService,
  updatePertanyaanService,
  deletePertanyaanService,
} from "../services/pertanyaanService.js";

/**
 * GET: Ambil daftar pertanyaan dalam indikator
 */
export const getPertanyaan = async (req, res, next) => {
  try {
    const { indikatorId } = req.params;

    const result = await getPertanyaanService(indikatorId);

    return success(res, "Berhasil mengambil daftar pertanyaan", result);

  } catch (err) {
    next(err);
  }
};


/**
 * POST: Tambah pertanyaan baru
 */
export const createPertanyaan = async (req, res, next) => {
  try {
    const { indikatorId } = req.params;
    const data = req.body;

    const result = await createPertanyaanService(indikatorId, data);

    return success(res, "Pertanyaan berhasil ditambahkan", result, null, 201);

  } catch (err) {
    next(err);
  }
};


/**
 * PATCH: Update pertanyaan
 */
export const updatePertanyaan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await updatePertanyaanService(id, data);

    return success(res, "Pertanyaan berhasil diperbarui", result);

  } catch (err) {
    next(err);
  }
};


/**
 * DELETE: Hapus pertanyaan
 */
export const deletePertanyaan = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deletePertanyaanService(id);

    return success(res, "Pertanyaan berhasil dihapus", null);

  } catch (err) {
    next(err);
  }
};
