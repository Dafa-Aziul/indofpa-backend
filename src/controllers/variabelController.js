import { success } from "../utils/response.js";
import {
  getVariabelService,
  createVariabelService,
  updateVariabelService,
  deleteVariabelService
} from "../services/variabelService.js";

// get list variabel by kuesioner
export const getVariabel = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const data = await getVariabelService(kuesionerId);

    return success(res, "Berhasil mengambil data variabel", data);

  } catch (err) {
    next(err);
  }
};

// create variabel
export const createVariabel = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const result = await createVariabelService(kuesionerId, req.body);

    return success(res, "Variabel berhasil dibuat", result, null, 201);

  } catch (err) {
    next(err);
  }
};

// update variabel
export const updateVariabel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await updateVariabelService(id, req.body);

    return success(res, "Variabel berhasil diperbarui", result);

  } catch (err) {
    next(err);
  }
};

// delete variabel
export const deleteVariabel = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteVariabelService(id);

    return success(res, "Variabel berhasil dihapus");

  } catch (err) {
    next(err);
  }
};
