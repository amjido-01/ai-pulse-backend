import { Router } from "express";
import { register } from "../controllers/userController/register";
import { login } from "../controllers/userController/login";
import { getUsers } from "../controllers/userController/getUsers";
import { getUser } from "../controllers/userController/getUser";
import { logout } from "../controllers/userController/logout";
import { profile } from "../controllers/userController/profile";
import { authenticateToken } from "../middleware/auth";
import { refreshToken } from "../controllers/userController/refresh-token";
import { interests } from "../controllers/interestController/interests";
import { setUserFrequency } from "../controllers/frequencyController/setUserFrequency";
import { getUserFrequency } from "../controllers/frequencyController/getUserFrequency";
import { fetchAndSaveAIProducts } from "../controllers/fetchAndSaveAIProductsController/fetchAndSaveAIProducts";
import { deleteAllRecords } from "../utils/deleteRec";
import { getUserIntersts } from "../controllers/interestController/getInterests"
import { deleteInterest } from "../controllers/interestController/deleteInterest";
import { notification } from "../controllers/notificationController/notification";
import { feedback } from "../controllers/feedbackController/feedback";

const router = Router();


router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/users", authenticateToken, getUsers)
router.get("/fetch-ai-products", fetchAndSaveAIProducts)
router.get("/user/:id", getUser)
router.post("/frequency", authenticateToken, setUserFrequency)
router.get("/frequency", authenticateToken, getUserFrequency)
router.delete("/interests/:id", authenticateToken, deleteInterest)
router.post("/interests", authenticateToken, interests)
router.get("/interests", authenticateToken, getUserIntersts)
router.get("/notifications", authenticateToken, notification)
router.post("/refresh-token", refreshToken)
router.post("/send-feedback", authenticateToken, feedback)
router.delete("/dl", deleteAllRecords)
router.get("/profile", authenticateToken, profile)


export default router;