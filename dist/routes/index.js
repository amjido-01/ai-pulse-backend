"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const router = (0, express_1.Router)();
router.use("/api/v1/auth", userRoutes_1.default);
router.use("/api/v1", userRoutes_1.default);
// router.use("/api/v1/products",  productRoutes)
exports.default = router;
//# sourceMappingURL=index.js.map