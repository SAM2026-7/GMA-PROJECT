import { Router } from 'express';
import { registerHandler, loginHandler, meHandler } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authMiddleware, meHandler);

export const authRouter = router;
