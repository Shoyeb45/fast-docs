import { SuccessMsgResponse } from '../../core/ApiResponse';
import { asyncHandler } from '../../core/asyncHandler';
import KeystoreRepo from '../../database/repositories/KeyStoreRepo';
import { Router } from 'express';
import authentication from './authentication';
import { ProtectedRequest } from '../../types/app-requests';

const router = Router();

router.use(authentication);

router.delete(
    '/',
    asyncHandler(async (req: ProtectedRequest, res) => {
        await KeystoreRepo.remove(req.keystore.id);
        new SuccessMsgResponse('Logout Success').send(res);
    }),
);

export default router;
