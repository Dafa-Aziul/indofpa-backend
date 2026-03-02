import { success } from "../utils/response.js";
import { importKuesionerService } from "../services/importKuesionerService.js";

export const importKuesionerController = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await importKuesionerService(req.file.path, userId);

        return success(
            res,
            "Kuesioner berhasil diimport",
            { kuesionerId: result.kuesionerId },
            null,
            201
        );
    } catch (error) {
        next(error);
    }
};