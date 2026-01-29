import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createEvent } from "ics";

dotenv.config();

/* ===============================
   SendGrid Transporter
================================ */
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,          // STARTTLS port (works on Render)
  secure: false,      // false for STARTTLS
  auth: {
    user: process.env.SENDGRID_USER, // literally "apikey"
    pass: process.env.SENDGRID_PASS, // your SendGrid API key
  },
  connectionTimeout: 10000,          // prevent timeout crash
});

/* ===============================
   Helpers
================================ */
function convertTo24Hour(timeStr) {
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

/* ===============================
   Send Booking Confirmation
================================ */
export const sendConfirmationEmail = async (booking) => {
  try {
    if (!booking) return console.log("❌ No booking provided");

    const { date, time, email, fullName, serviceName, price, city } = booking;

    if (!email) return console.log("❌ Booking has no email address");

    const dateParts = date.split("-").map(Number);
    const convertedTime = convertTo24Hour(time);

    if (!convertedTime) return console.log("❌ Invalid time format");

    /* ===============================
       Calendar Event (.ics)
    ================================ */
    const event = {
      start: [...dateParts, convertedTime.hour, convertedTime.minute],
      duration: { hours: 1 },
      title: `OnFleekHairven Appointment: ${serviceName}`,
      description: `Appointment confirmed for ${fullName}`,
      location: "Southeast London, SE28",
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: "OnFleekHairven", email: process.env.SENDGRID_USER },
      attendees: [{ name: fullName, email }],
    };

    const { error: icsError, value: icsFile } = createEvent(event);
    if (icsError) return console.log("❌ ICS creation error:", icsError);

    /* ===============================
       Email Options
    ================================ */
    const mailOptions = {
      from: `"OnFleek Hairven" <${process.env.SENDGRID_USER}>`,
      to: email,
      subject: "Your Booking Has Been Confirmed ✔️",
      text: `
Booking Confirmation

Dear ${fullName},

Your booking has been successfully confirmed.

Service: ${serviceName}
Date: ${date}
Time: ${time}
Price: £${price}
City: ${city}

Address: Southeast London SE28
Contact: 07930846512
Payment: Cash on arrival

Thank you for choosing OnFleek Hairven.
      `,
      html: `
<div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f8; padding:40px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.1);">

    <h2 style="color:#d63384; text-align:center; margin-bottom:20px;">🎉 Booking Confirmed!</h2>

    <p>Hi <strong>${fullName}</strong>,</p>
    <p>Your booking has been <strong style="color:#d63384;">successfully confirmed</strong>. Here are your appointment details:</p>

    <div style="margin:25px 0; padding:25px; background:#fde2f1; border-left:5px solid #d63384; border-radius:8px;">
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Price:</strong> £${price}</p>
      <p><strong>City:</strong> ${city}</p>
    </div>

    <div style="margin:20px 0; padding:20px; background:#fff0f6; border-radius:8px; border:1px solid #ffd6e0;">
      <p><strong>Address:</strong> 📍 Southeast London, SE28</p>
      <p style="color:#d63384;"><strong>Confidential:</strong> This address is strictly for the individual who booked the appointment.</p>
      <p><strong>Contact:</strong> 07930846512</p>
      <p><strong>Payment:</strong> Cash on arrival</p>
    </div>

    <p style="margin-top:30px;">Thank you for choosing <strong>OnFleek Hairven</strong>. We look forward to seeing you soon!</p>

    <p style="color:#6b7280; font-size:14px; margin-top:20px; text-align:center;">Warm regards,<br/><strong>OnFleekHairven Team</strong></p>

  </div>
</div>
      `,
      attachments: [
        {
          filename: "appointment.ics",
          content: icsFile,
          contentType: "text/calendar",
        },
      ],
    };

    /* ===============================
       Send Email (non-blocking)
    ================================ */
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);

  } catch (error) {
    console.error("❌ SendGrid email failed:", error.message);
  }
};
