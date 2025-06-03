import { Router } from "express";
import { createProfile, getCurrentUser, me } from "../controllers/userController";
import { verifyTokenMiddleware } from "../middlewares/userMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/userSchema";

const router = Router();

router.get("/me", verifyTokenMiddleware, me);
router.post("/profile", verifyTokenMiddleware, validateBody(createProfileSchema), createProfile);
router.get("/get-user", verifyTokenMiddleware, getCurrentUser);

export default router;
