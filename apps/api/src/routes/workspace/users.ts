import { Router } from 'express';
import { asyncHandler } from '../../core/asyncHandler.js';
import { ProtectedRequest } from '../../types/app-requests.js';
import UserRepo from '../../database/repositories/UserRepo.js';
import { SuccessResponse } from '../../core/ApiResponse.js';
import authentication from '../auth/authentication.js';

const router = Router();

router.use(authentication);

router.get(
  '/search',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const users = await UserRepo.searchForInvite(q, 10);
    new SuccessResponse('OK', users).send(res);
  })
);

export default router;
