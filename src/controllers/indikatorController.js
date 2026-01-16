import { success } from "../utils/response.js";

import {
  getIndikatorService,
  createIndikatorService,
  updateIndikatorService,
  deleteIndikatorService
} from "../services/indikatorService.js";


// get indikator list
export const getIndikator = async (req, res, next) => {
  try {
    const { variabelId } = req.params; 

    const result = await getIndikatorService(variabelId);

    return success(res, "Berhasil mengambil daftar indikator", result);
  } catch (err) {
    next(err);
  }
};


// create indikator
export const createIndikator = async (req, res, next) => {
  try {
    const { variabelId } = req.params;

    const result = await createIndikatorService(variabelId, req.body);

    return success(res, "Indikator berhasil dibuat", result, null, 201);
  } catch (err) {
    next(err);
  }
};


// update indikator
export const updateIndikator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateIndikatorService(id, req.body);

    return success(res, "Indikator berhasil diperbarui", result);
  } catch (err) {
    next(err);
  }
};


// delete indikator
export const deleteIndikator = async (req, res, next) => {
  try {
    const { id } = req.params; 
    await deleteIndikatorService(id);

    return success(res, "Indikator berhasil dihapus");
  } catch (err) {
    next(err);
  }
};
