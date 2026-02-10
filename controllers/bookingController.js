import Booking from "../models/Booking.js";
import { sendConfirmationEmail } from "../utils/sendEmail.js";
import BlockedDate from "../models/BlockedDate.js";
import { sendAdminEmail } from "../utils/sendAdminEmail.js";

// Create booking


export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // ✅ Check if date is blocked BEFORE saving booking
    const existingBlocked = await BlockedDate.findOne({
      date: bookingData.date,
    });

    if (existingBlocked) {
      return res
        .status(400)
        .json({ message: "Date is blocked. Choose another date." });
    }

    // ✅ Create booking
   const booking = await Booking.create(bookingData);

// ✅ Try sending email but don't break booking if it fails
try {
  await sendAdminEmail(booking);
} catch (emailError) {
  console.error("Email sending failed:", emailError);
}

res.status(201).json(booking);



// Admin fetch all bookings
export const getBookings = async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
};

// Admin confirms payment
export const confirmBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = "confirmed";
  await booking.save();

  // SEND EMAIL
  await sendConfirmationEmail(booking);

  res.json({ message: "Booking confirmed & email sent" });
};
