import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/asyncHandler';
import { ProtectedRequest } from '../../types/app-requests';
import type { DocAccessRequest } from '../../types/app-requests';
import DocService from '../../services/DocService';
import { SuccessResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import authentication from '../auth/authentication';
import { requireDocAccess } from '../../middlewares/requireDocAccess.middleware';
import ShareService from '../../services/ShareService';

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
  requireDocAccess({ minRole: 'viewer' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const doc = req.doc;
    const payload = {
      ...doc,
      yjsState: doc.yjsState ? (doc.yjsState as Buffer).toString('base64') : undefined,
      role: req.docRole,
    };
    if (payload.yjsState === undefined) delete payload.yjsState;
    new SuccessResponse('OK', payload).send(res);
  })
);

router.patch(
  '/:id',
  validator(schema.docIdParam, ValidationSource.PARAM),
  validator(schema.updateDocBody, ValidationSource.BODY),
  requireDocAccess({ minRole: 'editor' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const body = req.body as { title?: string; content?: string; yjsState?: string; folderId?: number | null; orderIndex?: number };
    const { yjsState: yjsStateB64, ...rest } = body;
    const updatePayload = { ...rest } as Parameters<typeof DocService.updateDocById>[1];
    if (yjsStateB64 !== undefined) (updatePayload as Record<string, unknown>).yjsState = Buffer.from(yjsStateB64, 'base64');
    const doc = await DocService.updateDocById(req.doc.id, updatePayload);
    const payload = {
      ...doc,
      yjsState: doc.yjsState ? (doc.yjsState as Buffer).toString('base64') : undefined,
      role: req.docRole,
    };
    if (payload.yjsState === undefined) delete payload.yjsState;
    new SuccessResponse('Updated', payload).send(res);
  })
);

router.delete(
  '/:id',
  validator(schema.docIdParam, ValidationSource.PARAM),
  requireDocAccess({ minRole: 'owner' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    await DocService.deleteDoc(req.user!.id, req.doc.id);
    new SuccessMsgResponse('Document deleted').send(res);
  })
);

router.get(
  '/:id/shares',
  validator(schema.docIdParam, ValidationSource.PARAM),
  requireDocAccess({ minRole: 'owner' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const shares = await ShareService.listShares(req.doc.id, req.user!.id);
    new SuccessResponse('OK', shares).send(res);
  })
);

router.post(
  '/:id/shares',
  validator(schema.docIdParam, ValidationSource.PARAM),
  validator(schema.createShareBody, ValidationSource.BODY),
  requireDocAccess({ minRole: 'owner' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const { userId, role } = req.body as { userId: number; role: 'editor' | 'viewer' | 'commenter' };
    const share = await ShareService.inviteUser(req.doc.id, req.user!.id, userId, role);
    new SuccessResponse('User invited', share).send(res);
  })
);

router.patch(
  '/:id/shares/:shareId',
  validator(schema.docIdShareIdParams, ValidationSource.PARAM),
  validator(schema.updateShareBody, ValidationSource.BODY),
  requireDocAccess({ minRole: 'owner' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const shareId = Number(req.params.shareId);
    const { role } = req.body as { role: 'editor' | 'viewer' | 'commenter' };
    const share = await ShareService.updateShareRole(req.doc.id, req.user!.id, shareId, role);
    new SuccessResponse('Share updated', share).send(res);
  })
);

router.delete(
  '/:id/shares/:shareId',
  validator(schema.docIdShareIdParams, ValidationSource.PARAM),
  requireDocAccess({ minRole: 'owner' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const shareId = Number(req.params.shareId);
    await ShareService.removeShare(req.doc.id, req.user!.id, shareId);
    new SuccessMsgResponse('Share removed').send(res);
  })
);

router.post(
  '/:id/share-link',
  validator(schema.docIdParam, ValidationSource.PARAM),
  validator(schema.shareLinkBody, ValidationSource.BODY),
  requireDocAccess({ minRole: 'owner' }),
  asyncHandler(async (req: DocAccessRequest, res) => {
    const shareForAll = (req.body as { shareForAll?: boolean }).shareForAll;
    const result = await ShareService.getOrCreateShareToken(req.doc.id, req.user!.id, shareForAll);
    new SuccessResponse('Share link', result).send(res);
  })
);

export default router;
