"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const register_1 = require("../controllers/userController/register");
const login_1 = require("../controllers/userController/login");
const getUsers_1 = require("../controllers/userController/getUsers");
const getUser_1 = require("../controllers/userController/getUser");
const logout_1 = require("../controllers/userController/logout");
const profile_1 = require("../controllers/userController/profile");
const auth_1 = require("../middleware/auth");
const refresh_token_1 = require("../controllers/userController/refresh-token");
const cors_1 = __importDefault(require("cors"));
const router = (0, express_1.Router)();
router.post("/register", register_1.register);
router.post("/login", login_1.login);
router.post("/logout", logout_1.logout);
router.get("/users", (0, cors_1.default)(), auth_1.authenticateToken, getUsers_1.getUsers);
router.get("/user/:id", getUser_1.getUser);
router.post("/refresh-token", refresh_token_1.refreshToken);
router.get("/profile", auth_1.authenticateToken, profile_1.profile);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map