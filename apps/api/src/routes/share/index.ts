import { Router } from 'express';
import { asyncHandler } from '../../core/asyncHandler.js';
import DocRepo from '../../database/repositories/DocRepo.js';
import { SuccessResponse } from '../../core/ApiResponse.js';
import { NotFoundError } from '../../core/ApiError.js';

const router = Router();

/** Public share link: anyone with the link can view the doc when shareForAll is true. */
router.get(
  '/s/:token',
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const raw = req.params.token;
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (!token) {
      throw new NotFoundError('Share link invalid');
    }
    const doc = await DocRepo.findByShareToken(token);
    if (!doc) {
      throw new NotFoundError('Share link invalid or expired');
    }
    const payload = {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      yjsState: doc.yjsState ? (doc.yjsState as Buffer).toString('base64') : undefined,
      role: 'viewer' as const,
    };
    if (payload.yjsState === undefined) delete payload.yjsState;
    new SuccessResponse('OK', payload).send(res);
  })
);

export default router;
