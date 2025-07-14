import { Router } from "express";

import { internalAuthMiddleware } from "../middlewares/internalAuthMiddleware";
import { validateBody } from "../middlewares/validateBody";

import { createUserProfile } from "../controllers/userController";
import { createProfileSchema } from "../schemas/userSchema";

const router = Router();

// === Création de profil (appel interne, post-inscription) ===
router.post(
    "/create-profile",
    internalAuthMiddleware,
    validateBody(createProfileSchema),
    createUserProfile
);

export default router;
