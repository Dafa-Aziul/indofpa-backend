import { success, error } from "../utils/response.js";
import { getKuesionerService } from "../services/kuesionerService.js";

export const getKuesionerService = async (req, res) => {
    try {
        const {
            search = "",
            status = "",
            page = 1,
            limit = 10,
        } = req.query;

        const resutl = await getKuesionerService({
            search,
            status,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (err) {
        return error(res, {
            message: "Gagal mengambil data kuesioner",
            errors: err.message,
            code: 500,
        })
    }
}