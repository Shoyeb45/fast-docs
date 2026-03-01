import { Request } from 'express';
import { Keystore, User, Doc } from '@prisma/client';


declare interface ProtectedRequest extends Request {
    user: User;
    accessToken: string;
    keystore: Keystore;
}

declare interface Tokens {
    accessToken: string;
    refreshToken: string;
}

/** After optionalAuth: user may be set. After requireDocAccess: doc and docRole are set. */
declare interface DocAccessRequest extends Request {
    user?: User;
    doc: Doc;
    docRole: 'owner' | 'editor' | 'viewer' | 'commenter';
}

