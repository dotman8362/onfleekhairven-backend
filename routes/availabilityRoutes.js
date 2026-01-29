import express from "express";
import {
  blockDate,
  getBlockedDates,
  unblockDate,
  blockMultipleDates,
  unblockMultipleDates
} from "../controllers/availabilityController.js";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/availability/block", auth, blockDate);
router.get("/availability", getBlockedDates);
router.delete("/availability/:date", auth, unblockDate);

router.post("/block-dates", blockMultipleDates); // multiple dates
router.post("/unblock-dates", unblockMultipleDates); // POST body: { dates: ["2026-02-15", "2026-02-16"] }



export default router;
