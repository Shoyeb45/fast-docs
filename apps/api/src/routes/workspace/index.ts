import { Router } from 'express';
import workspaceRouter from './workspace';
import docsRouter from './docs';
import foldersRouter from './folders';

const router = Router();

router.use('/', workspaceRouter);
router.use('/docs', docsRouter);
router.use('/folders', foldersRouter);

export default router;
