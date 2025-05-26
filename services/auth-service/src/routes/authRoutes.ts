import { Router } from 'express';
import { register, login, logout, activateUser } from '../controllers/authController';
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

router.get('/activate', activateUser);

export default router;
