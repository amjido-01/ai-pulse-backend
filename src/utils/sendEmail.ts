import nodemailer from "nodemailer"


// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});


export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        text: body,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }