import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimit';
import { loginSchema, registerSchema } from '../schemas/authSchema';
import { validateBody } from "../middlewares/validateBody";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  register
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  login
);

router.post('/logout', logout);

export default router;
