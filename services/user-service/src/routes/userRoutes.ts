import { Router } from "express";
import { createProfile, me } from "../controllers/userController";
import { verifyTokenMiddleware } from "../../src/middlewares/userMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/userSchema";

const router = Router();

router.get("/me", verifyTokenMiddleware, me);
router.post("/profile", verifyTokenMiddleware, validateBody(createProfileSchema), createProfile);

export default router;
