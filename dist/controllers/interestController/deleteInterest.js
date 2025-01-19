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
exports.deleteInterest = void 0;
const db_1 = __importDefault(require("../../config/db"));
const deleteInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let userData = yield (req === null || req === void 0 ? void 0 : req.user);
    try {
        const user = yield db_1.default.user.findUnique({
            where: {
                id: userData === null || userData === void 0 ? void 0 : userData.id
            },
            include: {
                interest: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the interest exists
        const interestToDelete = yield db_1.default.interest.findUnique({
            where: { id: parseInt(id) } // Ensure the ID is parsed correctly
        });
        if (!interestToDelete) {
            return res.status(404).json({ message: 'Interest not found' });
        }
        // Delete the interest from the database
        yield db_1.default.interest.delete({
            where: { id: parseInt(id) }
        });
        // Fetch the updated user interests
        const updatedUser = yield db_1.default.user.findUnique({
            where: { id: userData === null || userData === void 0 ? void 0 : userData.id },
            include: { interest: true }
        });
        // Respond with the updated user data
        res.status(200).json({ user: updatedUser, message: 'Interest deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the interest' });
    }
});
exports.deleteInterest = deleteInterest;
//# sourceMappingURL=deleteInterest.js.map