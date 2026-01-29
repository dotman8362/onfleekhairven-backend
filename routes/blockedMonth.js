import express from "express";
import BlockedMonth from "../models/BlockedMonth.js";

const router = express.Router();

/* Block a month */
router.post("/block-month", async (req, res) => {
  const { month, year } = req.body;

  try {
    const blocked = await BlockedMonth.create({ month, year });
    res.json({ success: true, blocked });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Month already blocked"
    });
  }
});

/* Get blocked months */
router.get("/blocked-months", async (req, res) => {
  const months = await BlockedMonth.find().sort({ year: 1, month: 1 });
  res.json(months);
});

/* ✅ Unblock a month */
router.delete("/unblock-month/:id", async (req, res) => {
  try {
    await BlockedMonth.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Unable to unblock month"
    });
  }
});

export default router;
