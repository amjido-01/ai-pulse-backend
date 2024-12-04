import { Router } from "express";
import { register } from "../controllers/userController/register";
import { login } from "../controllers/userController/login";
import { getUsers } from "../controllers/userController/getUsers";
import { getUser } from "../controllers/userController/getUser";
import { logout } from "../controllers/userController/logout";
import { profile } from "../controllers/userController/profile";
import { authenticateToken } from "../middleware/auth";
import { refreshToken } from "../controllers/userController/refresh-token";

const router = Router();


router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/users", authenticateToken, getUsers)
router.get("/user/:id", getUser)
router.post("/refresh-token", refreshToken)
router.get("/profile", authenticateToken, profile)


export default router;