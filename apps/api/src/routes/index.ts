import { Router } from 'express';

import healthRoutes from "./health/index.js";
import authRoutes from "./auth";
import workspaceRoutes from "./workspace";

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/workspace', workspaceRoutes);

export default router;