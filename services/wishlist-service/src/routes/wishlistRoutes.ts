import { Router } from "express";
import { createProfile, deleteProfile, getCurrentUser, me, updateProfile } from "../controllers/wishlistController";
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/wishlistSchema";
import { upload } from "../middlewares/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router = Router();


export default router;
