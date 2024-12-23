import { Router } from "express";
import userRoutes from "./userRoutes";


const router = Router()

router.use("/api/v1/auth", userRoutes)
router.use("/api/v1", userRoutes)

export default router