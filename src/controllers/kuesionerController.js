import { success } from "../utils/response.js";
import {
  getKuesionerService,
  createKuesionerService,
  updateKuesionerService,
  deleteKuesionerService,
  getKuesionerByIdService,
  arsipKuesionerService
} from "../services/kuesionerService.js";


//get all kuesioner
export const getKuesioner = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      kategoriId = "",
      page = 1,
      limit = 10,
    } = req.query;

    const result = await getKuesionerService({
      search,
      status,
      kategoriId,
      page: Number(page),
      limit: Number(limit),
    });

    return success(res, "Berhasil mengambil data kuesioner", result.items, result.meta);

  } catch (err) {
    next(err);
  }
};


// get detail kuesioner
export const getKuesionerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getKuesionerByIdService(id);

    return success(res, "Berhasil mengambil detail kuesioner", result);

  } catch (err) {
    next(err);
  }
};


// create kuesioner
export const createKuesioner = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await createKuesionerService(req.body, userId);

    return success(res, "Kuesioner berhasil dibuat", result, null, 201);

  } catch (err) {
    next(err);
  }
};


// update kuesioner
export const updateKuesioner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await updateKuesionerService(id, req.body);

    return success(res, "Kuesioner berhasil diperbarui", result);

  } catch (err) {
    next(err);
  }
};


// delete kuesioner
export const deleteKuesioner = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteKuesionerService(id);

    return success(res, "Kuesioner berhasil dihapus");

  } catch (err) {
    next(err);
  }
};

// arsip kuesioner
export const arsipKuesioner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await arsipKuesionerService(id);

    return success(res, "Kuesioner berhasil diarsipkan", result);

  } catch (err) {
    next(err);
  }
};
