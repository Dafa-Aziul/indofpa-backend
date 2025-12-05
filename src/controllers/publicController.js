import { success } from "../utils/response.js";
import {
  getPublicKuesionerService,
  submitKuesionerService,
  getPublicKuesionerListService,
  getPublicKuesionerDetailService
} from "../services/publicService.js";


export const getPublicKuesionerList = async (req, res, next) => {
  try {
    const data = await getPublicKuesionerListService();
    return success(res, "Berhasil mengambil daftar kuesioner publik", data);
  } catch (err) {
    next(err);
  }
};


// GET detail kuesioner public (by kuesionerId)
export const getPublicKuesionerDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getPublicKuesionerDetailService(id);

    return success(res, "Berhasil mengambil detail kuesioner publik", data);
  } catch (err) {
    next(err);
  }
};

export const getPublicKuesioner = async (req, res, next) => {
  try {
    const { kodeAkses } = req.params;
    const result = await getPublicKuesionerService(kodeAkses);

    return success(res, "Berhasil mengambil data kuesioner", result);
  } catch (err) {
    next(err);
  }
};

export const submitKuesioner = async (req, res, next) => {
  try {
    const { kodeAkses } = req.params;
    const { profile, jawaban } = req.body;

    const result = await submitKuesionerService(kodeAkses, profile, jawaban);

    return success(res, "Jawaban berhasil dikirim", result, null, 201);
  } catch (err) {
    next(err);
  }
};
