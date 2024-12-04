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
exports.refreshToken = void 0;
const jwtUtils_1 = require("../../utils/jwtUtils");
const db_1 = __importDefault(require("../../config/db"));
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }
    try {
        const user = yield db_1.default.user.findFirst({ where: { refreshToken } });
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const newRefreshToken = (0, jwtUtils_1.generateRefreshToken)({
            id: user.id,
            email: user.email
        });
        const accessToken = (0, jwtUtils_1.generateAccessToken)({
            id: user.id,
            email: user.email
        });
        yield db_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ accessToken });
    }
    catch (error) {
    }
});
exports.refreshToken = refreshToken;
//# sourceMappingURL=refresh-token.js.map