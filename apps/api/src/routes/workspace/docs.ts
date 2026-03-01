import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/asyncHandler';
import { ProtectedRequest } from '../../types/app-requests';
import DocService from '../../services/DocService';
import { SuccessResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import authentication from '../auth/authentication';

const router = Router();

router.use(authentication);

router.post(
  '/',
  validator(schema.createDocBody, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { title, folderId, content } = req.body as {
      title: string;
      folderId?: number | null;
      content?: string;
    };
    const doc = await DocService.createDoc(req.user.id, { title, folderId, content });
    new SuccessResponse('Document created', doc).send(res);
  })
);

router.get(
  '/:id',
  validator(schema.docIdParam, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const id = Number(req.params.id);
    const doc = await DocService.getDoc(req.user.id, id);
    const payload = {
      ...doc,
      yjsState: doc.yjsState ? (doc.yjsState as Buffer).toString('base64') : undefined,
    };
    if (payload.yjsState === undefined) delete payload.yjsState;
    new SuccessResponse('OK', payload).send(res);
  })
);

router.patch(
  '/:id',
  validator(schema.docIdParam, ValidationSource.PARAM),
  validator(schema.updateDocBody, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const id = Number(req.params.id);
    const body = req.body as { title?: string; content?: string; yjsState?: string; folderId?: number | null; orderIndex?: number };
    const { yjsState: yjsStateB64, ...rest } = body;
    const updatePayload = { ...rest } as Parameters<typeof DocService.updateDoc>[2];
    if (yjsStateB64 !== undefined) (updatePayload as Record<string, unknown>).yjsState = Buffer.from(yjsStateB64, 'base64');
    const doc = await DocService.updateDoc(req.user.id, id, updatePayload);
    const payload = {
      ...doc,
      yjsState: doc.yjsState ? (doc.yjsState as Buffer).toString('base64') : undefined,
    };
    if (payload.yjsState === undefined) delete payload.yjsState;
    new SuccessResponse('Updated', payload).send(res);
  })
);

router.delete(
  '/:id',
  validator(schema.docIdParam, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const id = Number(req.params.id);
    await DocService.deleteDoc(req.user.id, id);
    new SuccessMsgResponse('Document deleted').send(res);
  })
);

export default router;
