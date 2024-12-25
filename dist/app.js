"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// CORS Configuration 
const corsOptions = {
    origin: ["http://localhost:3000", "https://ai-pulse-frontend.vercel.app"], // Replace with your frontend URL
    credentials: true, // Allow server to accept cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
// Middleware
app.use((0, cors_1.default)(corsOptions)); // Enable CORS
app.use(express_1.default.json()); // Parse incoming JSON requests
app.use((0, cookie_parser_1.default)()); // Parse cookies
// Global CORS Headers Middleware
app.use((req, res, next) => {
    // const origin = req.headers.origin;
    // if (origin && corsOptions.origin.includes(origin)) {
    //   res.header("Access-Control-Allow-Origin", origin);
    // }
    res.header('Access-Control-Allow-Origin', '*');
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
// Start the Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map