import { success } from "../utils/response.js";
import {
  getMonitoringListService,
  getRespondenListService,
  getRespondenDetailService
} from "../services/monitoringService.js";

// Dashboard seluruh kuesioner + progress
export const getMonitoringList = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      kategori = "",
      page = 1,
      limit = 10,
    } = req.query;

    const result = await getMonitoringListService({
      search,
      status,
      kategori,
      page: Number(page),
      limit: Number(limit),
    });

    return success(
      res,
      "Berhasil mengambil monitoring dashboard",
      result.items,
      result.meta
    );

  } catch (err) {
    next(err);
  }
};

// List responden untuk kuesioner tertentu
export const getRespondenList = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;
    const { page, limit, search } = req.query;

    const result = await getRespondenListService(kuesionerId, {
      page,
      limit,
      search,
    });

    return success(res, "Berhasil mengambil daftar responden", result);
  } catch (err) {
    next(err);
  }
};

// Detail responden
export const getRespondenDetail = async (req, res, next) => {
  try {
    const { kuesionerId, id } = req.params;
    const result = await getRespondenDetailService(kuesionerId, id);

    return success(res, "Berhasil mengambil detail responden", result);
  } catch (err) {
    next(err);
  }
};
