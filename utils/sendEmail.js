import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createEvent } from "ics";

dotenv.config();

/* ===============================
   Nodemailer Transporter
================================ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,       // Gmail address
    pass: process.env.EMAIL_PASS,       // App password
  },
  connectionTimeout: 10000,             // Prevent Render timeout crash
});

// Optional: Verify SMTP once on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP not ready:", error.message);
  } else {
    console.log("✅ SMTP server ready");
  }
});

/* ===============================
   Helpers
================================ */
const convertTo24Hour = (timeStr) => {
  if (!timeStr) return null;

  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute };
};

/* ===============================
   Send Confirmation Email
   (FAIL-SAFE)
================================ */
export const sendConfirmationEmail = async (booking) => {
  try {
    if (!booking) {
      console.log("❌ No booking data provided");
      return;
    }

    const {
      date,
      time,
      email,
      fullName,
      serviceName,
      price,
      city,
    } = booking;

    if (!email) {
      console.log("❌ Booking has no email address");
      return;
    }

    /* ===============================
       Calendar Event (.ics)
    ================================ */
    const dateParts = date?.split("-").map(Number);
    const convertedTime = convertTo24Hour(time);

    if (!dateParts || !convertedTime) {
      console.log("❌ Invalid date or time format");
      return;
    }

    const event = {
      start: [...dateParts, convertedTime.hour, convertedTime.minute],
      duration: { hours: 1 },
      title: `OnFleek Hairven Appointment: ${serviceName}`,
      description: `Appointment confirmed for ${fullName}`,
      location: "Southeast London, SE28",
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: {
        name: "OnFleek Hairven",
        email: process.env.EMAIL_USER,
      },
      attendees: [{ name: fullName, email }],
    };

    const { error: icsError, value: icsFile } = createEvent(event);

    if (icsError) {
      console.log("❌ ICS creation error:", icsError);
      return;
    }

    /* ===============================
       Email Content
    ================================ */
    const mailOptions = {
      from: `"OnFleek Hairven" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Booking Has Been Confirmed ✔️",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f8; padding:40px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.1);">

            <h2 style="color:#d63384; text-align:center;">🎉 Booking Confirmed!</h2>

            <p>Hi <strong>${fullName}</strong>,</p>

            <p>Your booking has been successfully confirmed. Below are your appointment details:</p>

            <div style="margin:20px 0; padding:20px; background:#fde2f1; border-radius:8px;">
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Price:</strong> £${price}</p>
              <p><strong>City:</strong> ${city}</p>
            </div>

            <p><strong>Address:</strong> Southeast London, SE28</p>
            <p><strong>Payment:</strong> Cash on arrival</p>
            <p><strong>Contact:</strong> 07930846512</p>

            <p style="margin-top:30px;">
              Thank you for choosing <strong>OnFleek Hairven</strong>. We look forward to seeing you!
            </p>

            <p style="text-align:center; color:#6b7280;">
              — OnFleek Hairven Team
            </p>
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

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);

  } catch (error) {
    // 🔥 Email failure must NEVER crash the API
    console.error("❌ Email send failed:", error.message);
  }
};
