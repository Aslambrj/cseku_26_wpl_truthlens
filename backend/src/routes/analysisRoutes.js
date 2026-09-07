import { Router } from 'express';
import { createAnalysis, getAnalyses } from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getAnalyses);
router.post('/', createAnalysis);

export default router;
