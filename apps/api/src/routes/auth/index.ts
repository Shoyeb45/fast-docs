import { Router } from 'express';
import githubRoute from './github';
import refreshTokenRouter from './token';
import signoutRouter from './signout';
import meRouter from './me';

const router = Router();

router.use('/github', githubRoute);
router.use('/token', refreshTokenRouter);
router.use('/signout', signoutRouter);
router.use('/me', meRouter);

export default router;
