"use strict";
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
const interests_1 = require("../controllers/interestController/interests");
const setUserFrequency_1 = require("../controllers/frequencyController/setUserFrequency");
const getUserFrequency_1 = require("../controllers/frequencyController/getUserFrequency");
const fetchAndSaveAIProducts_1 = require("../controllers/fetchAndSaveAIProductsController/fetchAndSaveAIProducts");
const deleteRec_1 = require("../utils/deleteRec");
const getInterests_1 = require("../controllers/interestController/getInterests");
const deleteInterest_1 = require("../controllers/interestController/deleteInterest");
const notification_1 = require("../controllers/notificationController/notification");
const feedback_1 = require("../controllers/feedbackController/feedback");
const router = (0, express_1.Router)();
router.post("/register", register_1.register);
router.post("/login", login_1.login);
router.post("/logout", logout_1.logout);
router.get("/users", auth_1.authenticateToken, getUsers_1.getUsers);
router.get("/fetch-ai-products", fetchAndSaveAIProducts_1.fetchAndSaveAIProducts);
router.get("/user/:id", getUser_1.getUser);
router.post("/frequency", auth_1.authenticateToken, setUserFrequency_1.setUserFrequency);
router.get("/frequency", auth_1.authenticateToken, getUserFrequency_1.getUserFrequency);
router.delete("/interests/:id", auth_1.authenticateToken, deleteInterest_1.deleteInterest);
router.post("/interests", auth_1.authenticateToken, interests_1.interests);
router.get("/interests", auth_1.authenticateToken, getInterests_1.getUserIntersts);
router.get("/notifications", auth_1.authenticateToken, notification_1.notification);
router.post("/refresh-token", refresh_token_1.refreshToken);
router.post("/send-feedback", auth_1.authenticateToken, feedback_1.feedback);
router.delete("/dl", deleteRec_1.deleteAllRecords);
router.get("/profile", auth_1.authenticateToken, profile_1.profile);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map