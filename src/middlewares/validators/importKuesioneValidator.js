import { body } from "express-validator";
import ApiError from "../../utils/apiError.js";
import { validate } from "../validate.js";

// ===============================
// VALIDATOR IMPORT KUESIONER
// ===============================
export const importKuesionerValidator = [
    body().custom((value, { req }) => {
        // cek apakah file diupload
        if (!req.file) {
            throw new ApiError(400, "File Excel wajib diunggah");
        }

        // cek extension file
        const filename = req.file.originalname.toLowerCase();
        if (!filename.endsWith(".xlsx")) {
            throw new ApiError(400, "File harus berformat .xlsx");
        }

        return true;
    }),

    validate,
];