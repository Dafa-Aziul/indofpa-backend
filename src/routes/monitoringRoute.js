import { Router } from "express";

import { importRespondenController } from "../controllers/importRespondenController.js";
import upload from "../middlewares/uploadExcel.js";

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

router.post(
    "/:kuesionerId/import-responden",
    upload.single("file"),
    authMiddleware,
    importRespondenController
);

export default router;
