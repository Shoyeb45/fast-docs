import dotenv from 'dotenv';

dotenv.config();

export const originUrl = process.env.ORIGIN_URL;
export const isProduction = process.env.NODE_ENV === 'production';
export const timeZone = process.env.TZ;
export const port = process.env.PORT;

// github secrets
export const github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUrl: process.env.GIHUB_REDIRECT_URL,
};

// JWT token configuration
export const tokenInfo = {
    accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || '0'),
    refreshTokenValidity: parseInt(
        process.env.REFRESH_TOKEN_VALIDITY_SEC || '0',
    ),
    issuer: process.env.TOKEN_ISSUER || '',
    audience: process.env.TOKEN_AUDIENCE || '',
    publicKey: process.env.JWT_PUBLIC_KEY ?? '',
    privateKey: process.env.JWT_PRIVATE_KEY ?? '',
};

export const logDirectory = process.env.LOG_DIRECTORY;

export const dbUrl = process.env.DATABASE_URL ?? '';
