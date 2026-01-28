import express from "express";
import {
  blockDate,
  getBlockedDates,
  unblockDate,
} from "../controllers/availabilityController.js";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/availability/block", auth, blockDate);
router.get("/availability", getBlockedDates);
router.delete("/availability/:date", auth, unblockDate);


export default router;
