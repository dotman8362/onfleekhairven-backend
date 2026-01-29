import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { createEvent } from "ics";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_PASS);

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

export const sendConfirmationEmail = async (booking) => {
  try {
    const { date, time, email, fullName, serviceName, price, city } = booking;
    const dateParts = date.split("-").map(Number);
    const convertedTime = convertTo24Hour(time);
    if (!convertedTime) return console.log("❌ Invalid time format");

    const event = {
      start: [...dateParts, convertedTime.hour, convertedTime.minute],
      duration: { hours: 1 },
      title: `OnFleekHairven Appointment: ${serviceName}`,
      description: `Appointment confirmed for ${fullName}`,
      location: "Southeast London, SE28",
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: "OnFleekHairven", email: "onfleekhairven@gmail.com" },
      attendees: [{ name: fullName, email }],
    };

    const { error, value: icsFile } = createEvent(event);
    if (error) return console.log("❌ ICS creation error:", error);

    const msg = {
      to: email,
      from: "noreply@onfleekhairven.com",
      subject: `Your Booking Has Been Confirmed ✔️`,
      text: `Hi ${fullName}, your booking on ${date} at ${time} is confirmed.`,
      html: `<p>Hi <strong>${fullName}</strong>, your booking on <strong>${date} at ${time}</strong> is confirmed.</p>`,
      attachments: [
        {
          content: icsFile.toString(), // ✅ convert Buffer to string
          filename: "appointment.ics",
          type: "text/calendar",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (err) {
    console.error("❌ SendGrid API email failed:", err.message);
  }
};
