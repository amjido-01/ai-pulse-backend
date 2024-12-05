"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// app.use(cors({ origin: p, credentials: true }));
app.use((0, cors_1.default)({
    origin: 'https://ai-pulse-backend.onrender.com',
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(index_1.default);
app.get("/", (req, res) => {
    res.status(200).send("API is running...");
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=app.js.map