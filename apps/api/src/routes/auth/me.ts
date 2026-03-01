import { Router } from 'express';
import { asyncHandler } from '../../core/asyncHandler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessResponse } from '../../core/ApiResponse';
import authentication from './authentication';

const router = Router();

router.use(authentication);

router.get(
    '/',
    asyncHandler(async (req: ProtectedRequest, res) => {
        new SuccessResponse('OK', req.user).send(res);
    }),
);

export default router;
