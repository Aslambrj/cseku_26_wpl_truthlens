import { Router } from 'express';
import { deleteUser, listUsers, updateUserRole } from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
