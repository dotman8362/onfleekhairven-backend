import express from "express";
import {
  createBooking,
  getBookings,
  confirmBooking
} from "../controllers/bookingController.js";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/bookings", createBooking);
router.get("/admin/bookings", auth, getBookings);
router.patch("/admin/bookings/:id/confirm", auth, confirmBooking);

export default router;
