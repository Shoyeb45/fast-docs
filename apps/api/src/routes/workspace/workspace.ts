import { Router } from 'express';
import { asyncHandler } from '../../core/asyncHandler';
import { ProtectedRequest } from '../../types/app-requests';
import WorkspaceService from '../../services/WorkspaceService';
import { SuccessResponse } from '../../core/ApiResponse';
import authentication from '../auth/authentication';

const router = Router();

router.use(authentication);

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const data = await WorkspaceService.getWorkspace(req.user.id);
    new SuccessResponse('OK', data).send(res);
  })
);

export default router;
