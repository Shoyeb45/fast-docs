import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/asyncHandler';
import { ProtectedRequest } from '../../types/app-requests';
import { getAccessToken } from '../../core/authUtils';
import JWT from './../../core/jwtUtils';
import { validateTokenData, createTokens } from './../../core/authUtils';
import UserRepo from '../../database/repositories/UserRepo';
import KeystoreRepo from '../../database/repositories/KeyStoreRepo';
import { AuthFailureError } from '../../core/ApiError';
import crypto from 'crypto';
import { TokenRefreshResponse } from '../../core/ApiResponse';
const router = Router();

router.post(
    '/refresh',
    validator(schema.auth, ValidationSource.HEADER),
    validator(schema.refreshToken, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        // get access token
        req.accessToken = getAccessToken(req.headers?.authorization);

        // validate access token
        const accessTokenPayload = JWT.decode(req.accessToken);
        validateTokenData(accessTokenPayload);

        // get user id
        const userId = parseInt(accessTokenPayload.sub, 10);
        if (isNaN(userId))
            throw new AuthFailureError('Invalid user ID in token');

        // get user corresponding to that userID
        const user = await UserRepo.findById(userId);

        if (!user) throw new AuthFailureError('User not registered');

        req.user = user;

        const refreshTokenPayload = JWT.validate(req.body.refreshToken);
        validateTokenData(refreshTokenPayload);

        if (accessTokenPayload.sub !== refreshTokenPayload.sub)
            throw new AuthFailureError('Invalid access token');

        const keystore = await KeystoreRepo.find(
            req.user.id,
            accessTokenPayload.prm,
            refreshTokenPayload.prm,
        );

        if (!keystore) throw new AuthFailureError('Invalid access token');
        await KeystoreRepo.remove(keystore.id);

        const accessTokenKey = crypto.randomBytes(64).toString('hex');
        const refreshTokenKey = crypto.randomBytes(64).toString('hex');

        await KeystoreRepo.create(req.user.id, accessTokenKey, refreshTokenKey);
        const tokens = createTokens(req.user, accessTokenKey, refreshTokenKey);

        new TokenRefreshResponse(
            'Token Issued',
            tokens.accessToken,
            tokens.refreshToken,
        ).send(res);
    }),
);

export default router;
