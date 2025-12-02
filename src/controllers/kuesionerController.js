import { success } from "../utils/response.js";
import {
  getKuesionerService,
  createKuesionerService,
  updateKuesionerService,
  deleteKuesionerService,
  getKuesionerByIdService,
  arsipKuesionerService
} from "../services/kuesionerService.js";


/**
 * GET LIST KUESIONER
 */
export const getKuesioner = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      kategori = "",
      page = 1,
      limit = 10,
    } = req.query;

    const result = await getKuesionerService({
      search,
      status,
      kategori,
      page: Number(page),
      limit: Number(limit),
    });

    return success(res, "Berhasil mengambil data kuesioner", result.items, result.meta);

  } catch (err) {
    next(err);
  }
};


/**
 * GET DETAIL KUESIONER
 */
export const getKuesionerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    const result = await getKuesionerByIdService(id);

    return success(res, "Berhasil mengambil detail kuesioner", result);

  } catch (err) {
    next(err);
  }
};


/**
 * CREATE KUESIONER
 */
export const createKuesioner = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await createKuesionerService(req.body, userId);

    return success(res, "Kuesioner berhasil dibuat", result, null, 201);

  } catch (err) {
    next(err);
  }
};


/**
 * UPDATE KUESIONER
 */
export const updateKuesioner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await updateKuesionerService(id, req.body);

    return success(res, "Kuesioner berhasil diperbarui", result);

  } catch (err) {
    next(err);
  }
};


/**
 * DELETE KUESIONER
 */
export const deleteKuesioner = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteKuesionerService(id);

    return success(res, "Kuesioner berhasil dihapus");

  } catch (err) {
    next(err);
  }
};

export const arsipKuesioner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await arsipKuesionerService(id);

    return success(res,
      "Kuesioner berhasil diarsipkan",
      result
    );

  } catch (err) {
    next(err);
  }
};

