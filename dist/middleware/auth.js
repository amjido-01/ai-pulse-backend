"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const token = req.cookies.refreshToken;
    console.log(token, "from middleware");
    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        if (user) {
            req.user = user;
            next();
        }
    }
    catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map