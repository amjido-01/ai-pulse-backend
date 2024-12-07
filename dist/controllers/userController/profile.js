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
exports.profile = void 0;
const db_1 = __importDefault(require("../../config/db"));
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData = yield (req === null || req === void 0 ? void 0 : req.user);
    // console.log(userData, "from backend profile")
    try {
        const user = yield db_1.default.user.findUnique({
            where: { id: userData.id },
            select: { id: true, email: true },
        });
        console.log("hello", user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user, message: "This is a protected route" });
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.profile = profile;
//# sourceMappingURL=profile.js.map