import { success } from "../utils/response.js";
import {
    getKuesionerService,
    createKuesionerService,
    updateKuesionerService,
    deleteKuesionerService,
    getKuesionerByIdService
} from "../services/kuesionerService.js";

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

        return success(res, {
            message: "Berhasil mengambil data kuesioner",
            data: result,
        });

    } catch (err) {
        next(err)
    }
};

export const getKuesionerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await getKuesionerByIdService(id);

        return success(res, {
            message: "Berhasil mengambil detail data kuesioner",
            data: result,
        })
    } catch (err) {
        next(err);
    }
}

export const createKuesioner = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const body = req.body;

        const result = await createKuesionerService(body, userId);

        return success(res, {
            message: "Kuesioner berhasil dibuat",
            data: result,
            code: 201,
        })

    } catch (err) {
        next(err);
    }
}

export const updateKuesioner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await updateKuesionerService(id, req.body);

        return success(res, {
            message: "Kuesioner berhasil diperbarui",
            data: result
        })
    } catch (err) {
        next(err);
    }
}

export const deleteKuesioner = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteKuesionerService(id);

        return success(res, {
            message: " kuesioner berhasil dihapus",
        })
    } catch (err) {
        next(err);
    }
}


