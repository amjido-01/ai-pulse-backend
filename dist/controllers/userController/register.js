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
exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../config/db"));
const jwtUtils_1 = require("../../utils/jwtUtils");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password)
            return res.status(400).json({ message: "please provide all inputs, oo" });
        const existingUser = yield db_1.default.user.findUnique({
            where: {
                email
            }
        });
        if (existingUser) {
            return res.status(404).json({
                responseSuccessful: true,
                responseMessage: "This email has been registered already",
                responseBody: null
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield db_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        // Generate tokens
        const accessToken = (0, jwtUtils_1.generateAccessToken)({
            id: user.id,
            email: user.email
        });
        const refreshToken = (0, jwtUtils_1.generateRefreshToken)({
            id: user.id,
            email: user.email
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            //   secure: process.env.NODE_ENV === 'production',
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({
            responseSuccessful: true,
            responseMessage: 'User created successfully',
            responseBody: {
                user,
                accessToken,
                refreshToken
            }
        });
    }
    catch (error) {
        res.status(500).json({
            responseSuccessful: false,
            responseMessage: error,
            responseBody: null
        });
    }
});
exports.register = register;
//# sourceMappingURL=register.js.map