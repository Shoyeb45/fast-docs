import { Router } from 'express';

import healthRoutes from "./health/index.js";
import authRoutes from "./auth";
import workspaceRoutes from "./workspace";
import shareRoutes from "./share/index.js";

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/share', shareRoutes);

export default router;