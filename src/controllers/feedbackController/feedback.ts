import { Response, Request } from "express";
import nodemailer from "nodemailer";




  // Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

  

export const feedback = async (req: Request, res: Response): Promise<any> => {
    try {
        const { feedback } = req.body
        let userData = await (req as any)?.user // Assuming you have user information in the request
    
        if (!feedback) {
          return res.status(400).json({ message: "Feedback is required" })
        }

    
        // Setup email data
        const mailOptions = {
          from: `${userData?.email}`,
          to: process.env.EMAIL,
          subject: "New Feedback from AI Product Notification App",
          text: `User ID: ${userData?.id}\n\nFeedback: ${feedback}`,
        }
    
        // Send email
        await transporter.sendMail(mailOptions)
    
        res.status(200).json({ message: "Feedback sent successfully" })
      } catch (error) {
        console.error("Error sending feedback:", error)
        res.status(500).json({ message: "Failed to send feedback" })
      }
};