import { success } from "../utils/response.js";
import {
    getKategoriService,
    createKategoriService,
    updateKategoriService,
    deleteKategoriService,
} from "../services/kategoriService.js";

export const getKategori = async (req, res, next) => {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
        } = req.query;

        const result = await getKategoriService({
            search,
            page: Number(page),
            limit: Number(limit),
        });

        return success(res, "Berhasil mengambil data kategori", result.items, result.meta);

    } catch (err) {
        next(err);
    }
};

export const createKategori = async (req, res, next) => {
    try {
        const { nama } = req.body;

        const result = await createKategoriService({ nama });

        return success(res, "Berhasil membuat kategori", result, null, 201);

    } catch (err) {
        next(err);
    }
};

export const updateKategori = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama } = req.body;

        const result = await updateKategoriService(id, { nama });

        return success(res, "Kategori berhasil diperbarui", result);

    } catch (err) {
        next(err);
    }
};

export const deleteKategori = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deleteKategoriService(id);

        return success(res, "Kategori berhasil dihapus", null);

    } catch (err) {
        next(err);
    }
};
