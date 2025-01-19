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
exports.categorizeProduct = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const categorizeProduct = (tagline) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const response = yield groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant acting as a professional text analyzer and you will be giving a tagline of an ai software. Your job is to analyze the following tagline: "${tagline}" and determine the most appropriate category the software belongs to based on the key word from the tagline. Respond with a single word that represents the category. Avoid generic responses like 'others'.`,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });
        return ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || "uncategorized";
    }
    catch (error) {
        console.error("Error categorizing product tagline:", error);
        return "uncategorized"; // Default category if the API fails
    }
});
exports.categorizeProduct = categorizeProduct;
//# sourceMappingURL=categorizeProduct.js.map