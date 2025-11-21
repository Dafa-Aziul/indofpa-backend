import { success, error } from "../utils/response.js";
import {
    getKategoriService,
    createKategoriService,
    updateKategoriService,
    deleteKategoriService,
} from "../services/kategoriService.js";

export const getKategori = async (req, res) => {
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

        return success(res, {
            message: "Berhasil mengambil data kategori",
            data: result,
            code: 200,
        });

    } catch (err) {
        return error(res, {
            message: "Gagal mengambil data kategori",
            errors: err.message,
            code: 500,
        });
    }
};

export const createKategori = async (req, res) => {
    try {
        const { nama } = req.body;

        if (!nama) {
            return error(res, {
                message: "Nama kategori wajib diisi",
                code: 400,
            });
        }

        // ❗ Perbaikan: sebelumnya kamu memanggil createKategori(), padahal namanya createKategoriService()
        const data = await createKategoriService({ nama });

        return success(res, {
            message: "Berhasil membuat kategori",
            data,
            code: 201,
        });

    } catch (err) {
        return error(res, {
            message: "Gagal membuat kategori",
            errors: err.message,
            code: 500,
        });
    }
};

export const updateKategori = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama } = req.body;

        const data = await updateKategoriService(id, { nama });

        return success(res, {
            message: "kategori berhasil diperbarui",
            data,
        });
    } catch (err) {
        return error(res, {
            message: "Gagal perbarui kategori",
            errors: err.message,
            code: 500,
        });
    }
};


export const deleteKategori = async ( req, res ) => {
    try {
        const { id } = req.params;

        await deleteKategoriService(id);

        return success(res , {
            message: "Kategori berhasil dihapus",
        })
    } catch (err) {
        return error( res, {
            message: "Gagal menghapus kategori",
            errors: err.message,
            code: 500,
        });
    }
};
