import { Router } from "express";

import { internalAuthMiddleware } from "../middlewares/internalAuthMiddleware";
import { validateBody } from "../middlewares/validateBody";

import {
  createUserProfile,
  getUserProfileByAuthId,
} from "../controllers/userController";
import { createProfileSchema } from "../schemas/userSchema";

const router = Router();

router.post(
  "/create-profile",
  internalAuthMiddleware,
  validateBody(createProfileSchema),
  createUserProfile
);

router.get(
  "/find-by-auth/:authId",
  internalAuthMiddleware,
  getUserProfileByAuthId
);

export default router;
