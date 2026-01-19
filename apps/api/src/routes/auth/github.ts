import { Router } from 'express';
import schema from './schema';
import axios from 'axios';
import crypto from 'crypto';
import keystoreRepository from '../../database/repositories/KeyStoreRepo';
import { asyncHandler } from '../../core/asyncHandler';
import { github } from '../../config';
import { validator } from '../../middlewares/validator.middleware';
import { ValidationSource } from '../../helpers/validator';
import {
    BadRequestError,
    InternalError,
    NotFoundError,
} from '../../core/ApiError';
import userRepository from '../../database/repositories/UserRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import { createTokens } from '../../core/authUtils';
import { generateDeviceFingerprint } from '../../core/utils';

const router = Router();

router.get(
    '/',
    asyncHandler(async (_req, res) => {
        const redirectUri =
            github.redirectUrl +
            `?client_id=${github.clientId}` +
            `&scope=user:email`;

        res.redirect(redirectUri);
    }),
);

router.get(
    '/callback',
    validator(schema.githubCode, ValidationSource.QUERY),
    asyncHandler(async (req, res) => {
        const { code } = req.query;

        // exchange code for token
        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: github.clientId,
                client_secret: github.clientSecret,
                code,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (tokenRes.data?.error) throw new BadRequestError('Github AUTH Error.');

        const githubTokenData = new URLSearchParams(tokenRes.data as string)

        const githubToken = githubTokenData.get("access_token");
        
        if (!githubToken)
            throw new InternalError('GitHub did not return an access token.');

        const userRes = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${githubToken}`,
            },
        });

        
        const user = userRes.data;
        if (!user) throw new NotFoundError('Invalid github user data received.');
        
        // generate random secret token keys for security
        const accessTokenKey = crypto.randomBytes(64).toString('hex');
        const refreshTokenKey = crypto.randomBytes(64).toString('hex');
        const deviceFingerprint = generateDeviceFingerprint(req);

        console.log(deviceFingerprint);
        
        let createdUser = await userRepository.findUserByGithubId(user.id);
        
        if (!createdUser) {
            createdUser = await userRepository.create({
                name: user.name,
                email: user.email,
                avatarUrl: user.avatar_url,
                githubId: user.id,
                githubUsername: user.login,
            });
        }

        if (!createdUser) throw new InternalError('Failed to create new user.');

        const tokens = createTokens(
            createdUser,
            accessTokenKey,
            refreshTokenKey,
        );

        // store keys in KeyStore
        await keystoreRepository.create(
            createdUser.id,
            accessTokenKey,
            refreshTokenKey,
            tokens.refreshToken,
            deviceFingerprint
        )

        new SuccessResponse('Login Success', {
            user: createdUser,
            tokens, 
        }).send(res);
    }),
);
export default router;
