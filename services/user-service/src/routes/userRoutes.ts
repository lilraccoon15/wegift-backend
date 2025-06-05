import { Router } from "express";
import { createProfile, getCurrentUser, me, updateProfile } from "../controllers/userController";
import { verifyTokenMiddleware } from 'shared';
// import { verifyTokenMiddleware } from "../../../../shared/middlewares/verifyTokenMiddleware";
// import { verifyTokenMiddleware } from "../middlewares/userMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/userSchema";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/me", verifyTokenMiddleware, me);
router.post("/profile", verifyTokenMiddleware, validateBody(createProfileSchema), createProfile);
router.get("/get-user", verifyTokenMiddleware, getCurrentUser);
router.put("/update-profile", verifyTokenMiddleware, upload.single("picture"), updateProfile);

export default router;
