import { success, error } from "../utils/response.js";
import {
    getKuesionerService,
    createKuesionerService,
    updateKuesionerService,
    deleteKuesionerService,
    getKuesionerByIdService
} from "../services/kuesionerService.js";

export const getKuesioner = async (req, res) => {
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
        return error(res, {
            message: "Gagal mengambil data kuesioner",
            errors: err.message,
            code: 500,
        });
    }
};

export const getKuesionerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getKuesionerByIdService(id);

        return success(res, {
            message: "Berhasil mengambil detail data kuesioner",
            data: result,
        })
    } catch (err) {
        return error(res, {
            message: "Gagal mengambil detail data kuesioner",
            errors: err.message,
            code: 500
        })
    }
}

export const createKuesioner = async (req, res) => {
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
        return error(res, {
            message: "gagal membuat Kuesioner",
            errors: err.message,
            code: 500,
        })
    }
}

export const updateKuesioner = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateKuesionerService(id, req.body);

        return success(res, {
            message: "Kuesioner berhasil diperbarui",
            data: result
        })
    } catch (err) {
        return error(res, {
            message: "Gagal memperbarui kuesioner",
            errors: err.message,
            code: 500
        }
        )
    }
}

export const deleteKuesioner = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteKuesionerService(id);

        return success(res, {
            message: " kuesioner berhasil dihapus",
        })
    } catch (err) {
        return error(res, {
            message: "Gagal menghapus kuesioner",
            errors: err.message,
            code: 500
        })
    }
}


