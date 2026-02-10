import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAdminEmail = async (booking) => {
  const { error } = await resend.emails.send({
    from: "Bookings Team <onboarding@resend.dev>", // Change after domain verification
    to: [process.env.ADMIN_EMAIL],
    subject: "New Booking Notification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        
        <h2 style="color: #1a1a1a;">📅 New Booking Received</h2>
        
        <p style="font-size: 14px; color: #555;">
          A new booking has been successfully submitted on your website. 
          Please find the booking details below.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <h3 style="color: #333;">Customer Details</h3>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Full Name:</td>
            <td style="padding: 8px;">${booking.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Email Address:</td>
            <td style="padding: 8px;">${booking.email || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Phone Number:</td>
            <td style="padding: 8px;">${booking.phone || "Not Provided"}</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <h3 style="color: #333;">Booking Details</h3>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Service:</td>
            <td style="padding: 8px;">${booking.service || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Booking Date:</td>
            <td style="padding: 8px;">${booking.date || "N/A"}</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <p style="font-size: 13px; color: #777;">
          This is an automated notification from your booking system.
        </p>

        <p style="font-size: 13px; color: #777;">
          © ${new Date().getFullYear()} OnfleekHairven. All rights reserved.
        </p>

      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
  }
};
