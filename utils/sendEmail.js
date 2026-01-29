import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createEvent } from "ics";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function convertTo24Hour(timeStr) {
  // Example inputs: 9AM, 9PM, 12PM, 12AM, 9:30AM
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
    title: ` OnfleekHairven Appointment: ${serviceName}`,
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

 const mailOptions = {
  from: `"OnFleek Hairven" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your Booking Has Been Confirmed ✔️",
  text: `
    Booking Confirmation

    Dear ${fullName},

    Your booking has been successfully confirmed.

    Service: ${serviceName}
    Date: ${date}
    Time: ${time}
    Price: £${booking.price}
    City: ${booking.city}

    Address: Southeast London SE28
    Contact: 07930846512
    Payment: Cash on arrival

    Thank you for choosing OnFleek Hairven.
  `,
  html: `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f8; padding:40px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.1);">

    <!-- Header -->
    <h2 style="color:#d63384; font-family: 'Arial Black', sans-serif; text-align:center; margin-bottom:20px;">
      🎉 Booking Confirmed!
    </h2>

    <p style="color:#374151; font-size:16px; line-height:1.6;">
      Hi <strong>${fullName}</strong>,
    </p>

    <p style="color:#374151; font-size:15px; line-height:1.6;">
      Your booking has been <strong style="color:#d63384;">successfully confirmed</strong>. Here are your appointment details:
    </p>

    <!-- Appointment Details Box -->
    <div style="margin:25px 0; padding:25px; background:#fde2f1; border-left:5px solid #d63384; border-radius:8px;">
      <p style="margin:6px 0;"><strong>Service:</strong> ${serviceName}</p>
      <p style="margin:6px 0;"><strong>Date:</strong> ${date}</p>
      <p style="margin:6px 0;"><strong>Time:</strong> ${time}</p>
      <p style="margin:6px 0;"><strong>Price:</strong> £${booking.price}</p>
      <p style="margin:6px 0;"><strong>City:</strong> ${booking.city}</p>
    </div>

    <!-- Important Notes -->
    <div style="margin:20px 0; padding:20px; background:#fff0f6; border-radius:8px; border:1px solid #ffd6e0;">
      <p style="margin:6px 0;"><strong>Address:</strong> 📍 Southeast London, SE28</p>
      <p style="margin:6px 0; color:#d63384;"><strong>Confidential:</strong> This address is strictly for the individual who booked the appointment.</p>
      <p style="margin:6px 0;"><strong>Contact:</strong> 07930846512</p>
      <p style="margin:6px 0;"><strong>Payment:</strong> Cash on arrival</p>
    </div>

    <!-- Thank You -->
    <p style="margin-top:30px; font-size:16px; color:#374151;">
      Thank you for choosing <strong>OnFleek Hairven</strong>. We look forward to seeing you soon!
    </p>

    <p style="color:#6b7280; font-size:14px; margin-top:20px; text-align:center;">
      Warm regards,<br/>
      <strong>OnFleekHairven Team</strong>
    </p>

  </div>
</div>

  `,
  attachments: [
    {
      filename: "appointment.ics",
      content: value,
      contentType: "text/calendar",
    },
  ],
};
  await transporter.sendMail(mailOptions);
};
