import express from 'express';
import { Router } from 'express';
import { analyzeImage, analyzeText, analyzeVideo, createAnalysis, createShareLink, getAnalyses, getSharedAnalysis } from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/shared/:shareId', getSharedAnalysis);
router.use(requireAuth);
router.get('/', getAnalyses);
router.post('/image', analyzeImage);
router.post('/text', analyzeText);
router.post('/video', express.raw({ type: 'application/octet-stream', limit: '50mb' }), analyzeVideo);
router.post('/:id/share', createShareLink);
router.post('/', createAnalysis);

export default router;
