import { success } from "../utils/response.js";
import {
  getPublicKuesionerService,
  submitKuesionerService
} from "../services/publicService.js";

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
