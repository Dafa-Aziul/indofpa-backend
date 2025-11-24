import { success } from "../utils/response.js";
import {
    createIndikatorService,
    deleteIndikatorService,
    getIndikatorByKuesionerService,
    updateIndikatorService
} from "../services/indikatorService.js";

// GET semua indikator berdasarkan kuesioner
export const getIndikator = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { kuesionerId } = req.params;

        const result = await getIndikatorByKuesionerService({
            page: Number(page),
            limit: Number(limit),
            kuesionerId: Number(kuesionerId)
        });

        return success(res,
            "Berhasil mengambil data indikator",
            result
        );

    } catch (err) {
        next(err);
    }
};


// CREATE indikator
export const createIndikator = async (req, res, next) => {
    try {
        const { kuesionerId } = req.params;

        const result = await createIndikatorService(req.body, kuesionerId);

        return success(res,
            "Indikator berhasil dibuat",
            result,
            201
        );

    } catch (err) {
        next(err);
    }
};


// UPDATE indikator (per indikator)
export const updateIndikator = async (req, res, next) => {
    try {
        const { id, kuesionerId } = req.params;
        // Jalankan update
        const result = await updateIndikatorService(id, req.body);

        return success(res,
            "Indikator berhasil diperbarui",
            result
        );

    } catch (err) {
        next(err);
    }
};


// DELETE indikator (per indikator)
export const deleteIndikator = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deleteIndikatorService(id);

        return success(res,
            "Indikator berhasil dihapus"
        );

    } catch (err) {
        next(err);
    }
};
