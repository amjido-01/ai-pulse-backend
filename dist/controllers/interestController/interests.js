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
exports.interests = void 0;
const db_1 = __importDefault(require("../../config/db"));
const interests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData = yield (req === null || req === void 0 ? void 0 : req.user);
    try {
        const { interests } = req.body;
        if (!Array.isArray(interests) || interests.length === 0) {
            return res.status(400).json({ message: 'Interests must be a non-empty array' });
        }
        // First, remove all existing interests for the user
        let userId = userData === null || userData === void 0 ? void 0 : userData.id;
        console.log(userId);
        yield db_1.default.interest.deleteMany({
            where: { userId },
        });
        // Then, add the new interests
        const interest = yield db_1.default.interest.createMany({
            data: interests.map(interest => ({
                userId,
                interest,
            })),
        });
        const getAllUserInterest = yield db_1.default.user.findUnique({
            where: { id: userId },
            include: {
                interest: true
            }
        });
        res.status(201).json({ message: 'Interests saved successfully', count: interest.count, responseBody: getAllUserInterest });
    }
    catch (error) {
        console.error('Error saving interests:', error);
        res.status(500).json({ message: 'An error occurred while saving interests' });
    }
});
exports.interests = interests;
//# sourceMappingURL=interests.js.map