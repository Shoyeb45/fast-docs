import { Router } from 'express';
import workspaceRouter from './workspace';
import docsRouter from './docs';
import foldersRouter from './folders';
import usersRouter from './users';

const router = Router();

router.use('/', workspaceRouter);
router.use('/docs', docsRouter);
router.use('/folders', foldersRouter);
router.use('/users', usersRouter);

export default router;
