import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createEvent } from "ics";

dotenv.config();

function convertTo24Hour(timeStr) {
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

export const sendConfirmationEmail = async (booking) => {
  try {
    const { date, time, email, fullName, serviceName } = booking;

    const dateParts = date.split("-").map(Number);
    const convertedTime = convertTo24Hour(time);

    if (!convertedTime) {
      console.log("❌ Invalid time format");
      return;
    }

    const event = {
      start: [...dateParts, convertedTime.hour, convertedTime.minute],
      duration: { hours: 1 },
      title: `OnfleekHairven Appointment: ${serviceName}`,
      description: `Appointment confirmed for ${fullName}`,
      location: "Southeast London, SE28",
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: "OnFleekHairven", email: process.env.EMAIL_USER },
      attendees: [{ name: fullName, email }],
    };

    const { error, value } = createEvent(event);

    if (error) {
      console.log("ICS Error:", error);
      return;
    }

    // ✅ CREATE TRANSPORTER ONLY WHEN SENDING
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"OnFleek Hairven" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Booking Has Been Confirmed ✔️",
      text: `
Booking Confirmation

Dear ${fullName},

Service: ${serviceName}
Date: ${date}
Time: ${time}
Price: £${booking.price}
City: ${booking.city}

Address: Southeast London SE28
Payment: Cash on arrival
      `,
      html: `...your HTML stays exactly the same...`,
      attachments: [
        {
          filename: "appointment.ics",
          content: value,
          contentType: "text/calendar",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent");

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};
