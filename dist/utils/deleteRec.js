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
exports.deleteAllRecords = deleteAllRecords;
const db_1 = __importDefault(require("../config/db")); // Ensure you import your Prisma client
function deleteAllRecords() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete all records from the "Aiproducts" table
            const deletedRecords = yield db_1.default.aiproducts.deleteMany({});
            console.log(`Deleted ${deletedRecords.count} records from the Aiproducts table.`);
        }
        catch (error) {
            console.error("Error deleting records:", error);
        }
        finally {
            yield db_1.default.$disconnect(); // Close the database connection
        }
    });
}
//# sourceMappingURL=deleteRec.js.map