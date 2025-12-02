import { success } from "../utils/response.js";
import {
  getDistribusiService,
  createDistribusiService,
  updateDistribusiService,
  deleteDistribusiService
} from "../services/distribusiService.js";

export const getDistribusi = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;
    const result = await getDistribusiService(kuesionerId);

    return success(res, "Berhasil mengambil distribusi", result);
  } catch (err) {
    next(err);
  }
};

export const createDistribusi = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const result = await createDistribusiService(kuesionerId, req.body);

    return success(res, "Distribusi berhasil dibuat", result, null, 201);
  } catch (err) {
    next(err);
  }
};

export const updateDistribusi = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await updateDistribusiService(id, req.body);

    return success(res, "Distribusi berhasil diperbarui", result);
  } catch (err) {
    next(err);
  }
};

export const deleteDistribusi = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteDistribusiService(id);

    return success(res, "Distribusi berhasil dihapus");
  } catch (err) {
    next(err);
  }
};
