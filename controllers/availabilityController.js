import Availability from "../models/Availability.js";

/**
 * ADD ONE BLOCKED DATE (ADMIN)
 */
export const blockDate = async (req, res) => {
  try {
    const { date } = req.body; // single date

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const availability = await Availability.findOneAndUpdate(
      {},
      { $addToSet: { unavailableDates: date } },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      unavailableDates: availability.unavailableDates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getBlockedDates = async (req, res) => {
  const availability = await Availability.findOne();
  res.json(availability?.unavailableDates || []);
};

export const unblockDate = async (req, res) => {
  const { date } = req.params;

  const availability = await Availability.findOneAndUpdate(
    {},
    { $pull: { unavailableDates: date } },
    { new: true }
  );

  if (!availability) {
    return res.status(404).json({ message: "No blocked dates found" });
  }

  res.json({
    success: true,
    unavailableDates: availability.unavailableDates,
  });
};


/**
 * BLOCK MULTIPLE DATES (ADMIN)
 */
export const blockMultipleDates = async (req, res) => {
  try {
    const { dates } = req.body; // expect an array of strings ["2026-02-15", "2026-02-16"]

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one date is required",
      });
    }

    // Add each date to unavailableDates array without duplicates
    const availability = await Availability.findOneAndUpdate(
      {},
      { $addToSet: { unavailableDates: { $each: dates } } },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      unavailableDates: availability.unavailableDates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * UNBLOCK MULTIPLE DATES (ADMIN)
 */
export const unblockMultipleDates = async (req, res) => {
  try {
    const { dates } = req.body; // expect an array of strings ["2026-02-15", "2026-02-16"]

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one date is required",
      });
    }

    const availability = await Availability.findOneAndUpdate(
      {},
      { $pull: { unavailableDates: { $in: dates } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      unavailableDates: availability?.unavailableDates || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
