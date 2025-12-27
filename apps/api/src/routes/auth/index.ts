import { Router } from 'express';
import githubRoute from './github';
import refreshTokenRouter from './token';

const router = Router();

router.use('/github', githubRoute);
router.use('/token', refreshTokenRouter);

export default router;
