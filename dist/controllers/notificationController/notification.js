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
exports.notification = void 0;
const db_1 = __importDefault(require("../../config/db"));
const notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData = yield (req === null || req === void 0 ? void 0 : req.user);
    try {
        const user = yield db_1.default.user.findUnique({
            where: {
                id: userData === null || userData === void 0 ? void 0 : userData.id
            },
            select: {
                notifications: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user, "hello");
        res.json({ notifications: user.notifications, user });
    }
    catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.notification = notification;
//# sourceMappingURL=notification.js.map