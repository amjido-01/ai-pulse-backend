"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedback = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create a transporter using SMTP
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const feedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { feedback } = req.body;
        let userData = yield (req === null || req === void 0 ? void 0 : req.user); // Assuming you have user information in the request
        if (!feedback) {
            return res.status(400).json({ message: "Feedback is required" });
        }
        // Setup email data
        const mailOptions = {
            from: `${userData === null || userData === void 0 ? void 0 : userData.email}`,
            to: process.env.EMAIL,
            subject: "New Feedback from AI Product Notification App",
            text: `User ID: ${userData === null || userData === void 0 ? void 0 : userData.id}\n\nFeedback: ${feedback}`,
        };
        // Send email
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Feedback sent successfully" });
    }
    catch (error) {
        console.error("Error sending feedback:", error);
        res.status(500).json({ message: "Failed to send feedback" });
    }
});
exports.feedback = feedback;
//# sourceMappingURL=feedback.js.map