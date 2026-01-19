import crypto from "crypto";

import { Request } from "express";

export const enum Header {
    API_KEY = 'x-api-key',
    AUTHORIZATION = 'authorization',
}

// export async function getUserData(user: AuthUser) {
//     const data = objectManipulator.pick(user, ['id', 'name', 'roles', 'email']);
//     return data;
// }

export function generateDeviceFingerprint(req: Request) {
    const components = [
        req.headers['user-agent'] || '',
        req.headers['accept-language'] || '',
        req.headers['accept-encoding'] || ''
    ];

    return crypto
        .createHash('sha256')
        .update(components.join('|'))
        .digest('hex');
}