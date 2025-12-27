import { Request } from 'express';
import { Keystore, User } from '@prisma/client';


declare interface ProtectedRequest extends Request {
    user: User;
    accessToken: string;
    keystore: Keystore;
}

declare interface Tokens {
    accessToken: string;
    refreshToken: string;
}

