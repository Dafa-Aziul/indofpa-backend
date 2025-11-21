import { success, error } from "../utils/response.js";
import { getKuesionerService } from "../services/kuesionerService.js";

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
