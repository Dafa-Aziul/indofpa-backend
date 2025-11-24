import { success } from "../utils/response.js";
import { getPertanyaanByKuesionerService,createPertanyaanService, updatePertanyaanService, deletePertanyaanService } from "../services/pertanyaanService.js";

export const getPertanyaanByKuesioner = async (req, res, next) => {
    try {
        const { kuesionerId } = req.params;
        const result = await getPertanyaanByKuesionerService(Number(kuesionerId));
        return success(res, "daftar pertanyaan berhasil didapatkan", result);
    } catch (err) {
        next(err)
    }
}

export const createPertanyaan = async (req, res, next) => {
    try {
        const { kuesionerId } = req.params;
        const result = await createPertanyaanService(req.body, kuesionerId);

        return success(res, "Pertanyaan berhasil dibuat", result, 201);

    } catch (err) {
        next(err);
    }
};

export const updatePertanyaan = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validasi ID
        const pertanyaanId = Number(id);
        if (!Number.isInteger(pertanyaanId)) {
            throw new ApiError(400, "ID harus berupa angka");
        }

        // Lanjut ke service
        const result = await updatePertanyaanService(pertanyaanId, req.body);

        return success(res, "Pertanyaan berhasil diperbarui", result);

    } catch (err) {
        next(err);
    }
};



export const deletePertanyaan = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deletePertanyaanService(id);

        return success(res, "Pertanyaan berhasil dihapus");

    } catch (err) {
        next(err);
    }
};