import { Router } from 'express';
import { createSermonHandler, getAllSermonsHandler, getSermonByIdHandler, updateSermonHandler, deleteSermonHandler, getRecentSermonsHandler } from '../controllers/sermonController';
import { authMiddleware } from '../middleware/auth';

export const sermonsRouter = Router();

sermonsRouter.post('/', authMiddleware, createSermonHandler);
sermonsRouter.get('/', authMiddleware, getAllSermonsHandler);
sermonsRouter.get('/recent', getRecentSermonsHandler);
sermonsRouter.get('/:id', getSermonByIdHandler);
sermonsRouter.put('/:id', authMiddleware, updateSermonHandler);
sermonsRouter.delete('/:id', authMiddleware, deleteSermonHandler);
