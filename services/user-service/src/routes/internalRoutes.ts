import { Router } from "express";

import { internalAuthMiddleware } from "../middlewares/internalAuthMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { upload } from "../middlewares/upload";

import {
    createUserProfile,
    deleteUserProfile,
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

router.delete(
    "/delete-profile",
    internalAuthMiddleware,
    upload.single("picture"),
    deleteUserProfile
);

export default router;
