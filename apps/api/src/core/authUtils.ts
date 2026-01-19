import { AuthFailureError, InternalError } from './ApiError';
import { Tokens } from './../types/app-requests';
import JWT, { JwtPayload } from './jwtUtils';
import { tokenInfo } from './../config';
import bcryptjs from 'bcryptjs';
import { User } from '@prisma/client';

export const getAccessToken = (authorization?: string) => {
    if (!authorization) throw new AuthFailureError('Invalid Authorization');
    if (!authorization.startsWith('Bearer '))
        throw new AuthFailureError('Invalid Authorization');
    return authorization.split(' ')[1];
};

export const validateTokenData = (payload: JwtPayload): boolean => {
    if (
        !payload ||
        !payload.iss ||
        !payload.sub ||
        !payload.aud ||
        !payload.prm ||
        payload.iss !== tokenInfo.issuer ||
        payload.aud !== tokenInfo.audience ||
        !/^\d+$/.test(payload.sub) // Validate that sub is a numeric string (user ID)
    )
        throw new AuthFailureError('Invalid Access Token');
    return true;
};

export const createTokens = (
    user: User,
    accessTokenKey: string,
    refreshTokenKey: string,
): Tokens => {
    const accessToken = JWT.encode(
        new JwtPayload(
            tokenInfo.issuer,
            tokenInfo.audience,
            user.id.toString(),
            accessTokenKey,
            tokenInfo.accessTokenValidity,
        ),
    );

    if (!accessToken) throw new InternalError('Failed to generated Access Token.');

    const refreshToken = JWT.encode(
        new JwtPayload(
            tokenInfo.issuer,
            tokenInfo.audience,
            user.id.toString(),
            refreshTokenKey,
            tokenInfo.refreshTokenValidity,
        ),
    );

    if (!refreshToken) throw new InternalError('Failed to generated Refresh Token.');

    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
    } as Tokens;
};

export const isPasswordCorrect = async function (userPassword: string, hashedPassword: string) {
    return await bcryptjs.compare(userPassword, hashedPassword);
};
