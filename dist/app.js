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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./routes/index"));
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const sendEmail_1 = require("./utils/sendEmail");
// app instance
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// CORS Configuration 
const corsOptions = {
    origin: "https://notify-ai.vercel.app", // "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow server to accept cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Global CORS Headers Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && corsOptions.origin.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }
    next();
});
// Routes
app.use(index_1.default);
// Root Route
app.get("/", (req, res) => {
    res.status(200).send("API is running...");
});
// Your server's Render URL
const SERVER_URL = "https://ai-pulse-backend.onrender.com"; // Replace with your Render app URL
// Schedule a self-ping every 14 minutes
node_cron_1.default.schedule("*/14 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(SERVER_URL);
        (0, sendEmail_1.sendEmail)("youndsadeeq10@gmail.com", `Self-ping successful: ${response.status} ${response.statusText}`, "pinging my server");
        console.log(`Self-ping successful: ${response.status} ${response.statusText}`);
    }
    catch (error) {
        console.error("Self-ping failed:", error);
    }
}));
// Start the Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map