import { success } from "../utils/response.js";

import {
  getIndikatorService,
  createIndikatorService,
  updateIndikatorService,
  deleteIndikatorService
} from "../services/indikatorService.js";


/**
 * GET LIST INDIKATOR (per Kuesioner)
 */
export const getIndikator = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const result = await getIndikatorService(kuesionerId);

    return success(res, "Berhasil mengambil daftar indikator", result);

  } catch (err) {
    next(err);
  }
};


/**
 * CREATE INDIKATOR
 */
export const createIndikator = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const result = await createIndikatorService(kuesionerId, req.body);

    return success(res, "Indikator berhasil dibuat", result, null, 201);

  } catch (err) {
    next(err);
  }
};


/**
 * UPDATE INDIKATOR
 */
export const updateIndikator = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await updateIndikatorService(id, req.body);

    return success(res, "Indikator berhasil diperbarui", result);

  } catch (err) {
    next(err);
  }
};


/**
 * DELETE INDIKATOR
 */
export const deleteIndikator = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteIndikatorService(id);

    return success(res, "Indikator berhasil dihapus");

  } catch (err) {
    next(err);
  }
};
