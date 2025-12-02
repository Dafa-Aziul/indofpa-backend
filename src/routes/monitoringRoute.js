import { Router } from "express";

import {
  getMonitoringList,
  getRespondenList,
  getRespondenDetail
} from "../controllers/monitoringController.js";

import {
  monitoringListValidator,
  respondenListValidator,
  respondenDetailValidator
} from "../middlewares/validators/monitoringValidator.js";
import { exportKuesionerExcel } from "../controllers/exportKuesionerController.js"

import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Dashboard seluruh kuesioner
router.get(
  "/",
  authMiddleware,
  monitoringListValidator,
  getMonitoringList
);

// List responden di 1 kuesioner
router.get(
  "/:kuesionerId/responden",
  authMiddleware,
  respondenListValidator,
  getRespondenList
);

// Detail responden di 1 kuesioner
router.get(
  "/:kuesionerId/responden/:id",
  authMiddleware,
  respondenDetailValidator,
  getRespondenDetail
);

router.get(
  "/:kuesionerId/export",
  authMiddleware,
  exportKuesionerExcel
);


export default router;
