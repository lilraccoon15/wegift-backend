import { Router } from 'express';
import { createProfile, me } from '../controllers/userController';
import { verifyTokenMiddleware } from '../../src/middlewares/userMiddleware';

const router = Router();

router.get('/me', verifyTokenMiddleware, me);
router.post('/profile', verifyTokenMiddleware, createProfile);


export default router;
