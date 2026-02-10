import Booking from "../models/Booking.js";
import { sendConfirmationEmail } from "../utils/sendEmail.js";
import BlockedDate from "../models/BlockedDate.js";
import { sendAdminEmail } from "../utils/sendAdminEmail.js";

// Create booking
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // Check if date is blocked
    const existingBlocked = await BlockedDate.findOne({
      date: bookingData.date,
    });

    if (existingBlocked) {
      return res
        .status(400)
        .json({ message: "Date is blocked. Choose another date." });
    }

    // Create booking
    const booking = await Booking.create(bookingData);

    // Try sending admin email
    try {
      await sendAdminEmail(booking);
    } catch (emailError) {
      console.error("Admin email failed:", emailError);
    }

    res.status(201).json(booking);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}; // ✅ YOU MISSED THIS BEFORE

// ================================
// Admin fetch all bookings
// ================================
export const getBookings = async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
};

// ================================
// Admin confirms payment
// ================================
export const confirmBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = "confirmed";
  await booking.save();

  // Try sending confirmation email
  try {
    await sendConfirmationEmail(booking);
  } catch (emailError) {
    console.error("Confirmation email failed:", emailError);
  }

  res.json({ message: "Booking confirmed & email sent" });
};
