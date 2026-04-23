import { Router } from 'express';
import authRoutes from './auth';
import quizRoutes from './quiz';
import walletRoutes from './wallet';
import membershipRoutes from './membership';
import aiRoutes from './ai';
import materialRoutes from './materials';
import notificationRoutes from './notifications';
import communityRoutes from './community';
import adminRoutes from './admin';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use('/wallet', walletRoutes);
router.use('/membership', membershipRoutes);
router.use('/ai', aiRoutes);
router.use('/materials', materialRoutes);
router.use('/notifications', notificationRoutes);
router.use('/community', communityRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Gyan Path API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
