import ApiError from "../utils/apiError.js";
import { importRespondenService } from "../services/importRespondenService.js";

export const importRespondenController = async (req, res, next) => {
    try {
        // pastikan file ada
        if (!req.file) {
            throw new ApiError(400, "File XLSX tidak ditemukan");
        }

        const { kuesionerId } = req.params;

        if (!kuesionerId || isNaN(Number(kuesionerId))) {
            throw new ApiError(400, "kuesionerId tidak valid");
        }

        const result = await importRespondenService(
            req.file.path,
            Number(kuesionerId)
        );

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};