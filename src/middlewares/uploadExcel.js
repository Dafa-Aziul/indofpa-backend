import multer from "multer";
import ApiError from "../utils/apiError.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname)
});

function fileFilter(req, file, cb) {
    if (!file.originalname.endsWith(".xlsx")) {
        cb(new ApiError(400, "File harus berformat .xlsx"), false);
    } else {
        cb(null, true);
    }
}

export default multer({ storage, fileFilter });