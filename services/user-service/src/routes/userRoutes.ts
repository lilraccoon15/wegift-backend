import { Router } from 'express';
import { register, login, me, logout } from '../controllers/userController';
import { verifyTokenMiddleware } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimit';
import { loginSchema, registerSchema } from '../schemas/userSchema';
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
router.get('/me', verifyTokenMiddleware, me);

export default router;
