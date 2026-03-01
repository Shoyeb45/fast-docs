import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/asyncHandler';
import { ProtectedRequest } from '../../types/app-requests';
import FolderService from '../../services/FolderService';
import { SuccessResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import authentication from '../auth/authentication';

const router = Router();

router.use(authentication);

router.post(
  '/',
  validator(schema.createFolderBody, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { name, parentId } = req.body as { name: string; parentId?: number | null };
    const folder = await FolderService.createFolder(req.user.id, { name, parentId });
    new SuccessResponse('Folder created', folder).send(res);
  })
);

router.patch(
  '/:id',
  validator(schema.folderIdParam, ValidationSource.PARAM),
  validator(schema.updateFolderBody, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const id = Number(req.params.id);
    const body = req.body as { name?: string; parentId?: number | null; orderIndex?: number };
    const folder = await FolderService.updateFolder(req.user.id, id, body);
    new SuccessResponse('Updated', folder).send(res);
  })
);

router.delete(
  '/:id',
  validator(schema.folderIdParam, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const id = Number(req.params.id);
    await FolderService.deleteFolder(req.user.id, id);
    new SuccessMsgResponse('Folder deleted').send(res);
  })
);

export default router;
