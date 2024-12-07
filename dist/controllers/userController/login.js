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
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../config/db"));
const jwtUtils_1 = require("../../utils/jwtUtils");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // console.log(req.cookies.refreshToken)
    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide all inputs one" });
        }
        // Find the user by email
        const existingUser = yield db_1.default.user.findUnique({
            where: { email }
        });
        // Check if the user exists
        if (!existingUser) {
            return res.status(403).json({ message: "Invalid login credentials" });
        }
        // Verify password
        const validPassword = yield bcrypt_1.default.compare(password, existingUser.password);
        if (!validPassword) {
            return res.status(403).json({ message: "Invalid login credentials" });
        }
        // Generate tokens
        const accessToken = (0, jwtUtils_1.generateAccessToken)({
            id: existingUser.id,
            email: existingUser.email
        });
        const refreshToken = (0, jwtUtils_1.generateRefreshToken)({
            id: existingUser.id,
            email: existingUser.email
        });
        console.log(refreshToken, "from login");
        yield db_1.default.user.update({
            where: { id: existingUser.id },
            data: { refreshToken: refreshToken }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // Send tokens as response
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            responseBody: existingUser
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "An error occurred during login" });
    }
});
exports.login = login;
// 5bcb88d58ff9
//# sourceMappingURL=login.js.map