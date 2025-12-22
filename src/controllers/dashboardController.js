import { success } from "../utils/response.js";
import { getDashboardService } from "../services/dashboardService.js";

export const getDashboard = async (req, res, next) => {
    try {
        const data = await getDashboardService();
        return success(res, "Berhasil mengambil data dashboard", data);
    } catch (err) {
        next(err);
    }
};
