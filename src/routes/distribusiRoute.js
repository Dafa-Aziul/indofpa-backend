import { Router } from "express";

import {
  getDistribusi,
  createDistribusi,
  updateDistribusi,
  deleteDistribusi
} from "../controllers/distribusiController.js";

import {
  getDistribusiValidator,
  createDistribusiValidator,
  updateDistribusiValidator,
  deleteDistribusiValidator
} from "../middlewares/validators/distribusiValidator.js";

import { authMiddleware } from "../middlewares/auth.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authMiddleware,
  getDistribusiValidator,
  getDistribusi
);

router.post(
  "/",
  authMiddleware,
  createDistribusiValidator,
  createDistribusi
);


router.patch(
  "/:id",
  authMiddleware,
  updateDistribusiValidator,
  updateDistribusi
);

router.delete(
  "/:id",
  authMiddleware,
  deleteDistribusiValidator,
  deleteDistribusi
);

export default router;
