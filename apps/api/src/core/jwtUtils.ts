import {
    sign,
    verify,
    TokenExpiredError as JwtTokenExpiredError,
} from 'jsonwebtoken';
import { BadTokenError, TokenExpiredError } from './ApiError';
import { tokenInfo } from '../config';

/*
 * issuer — Software organization who issues the token.
 * subject — Intended user of the token.
 * audience — Basically identity of the intended recipient of the token.
 * expiresIn — Expiration time after which the token will be invalid.
 * algorithm — Encryption algorithm to be used to protect the token.
 */

export class JwtPayload {
    aud: string;
    sub: string;
    iss: string;
    iat: number;
    exp: number;
    prm: string;

    constructor(
        issuer: string,
        audience: string,
        subject: string,
        param: string,
        validity: number,
    ) {
        this.iss = issuer;
        this.aud = audience;
        this.sub = subject;
        this.iat = Math.floor(Date.now() / 1000);
        this.exp = this.iat + validity;
        this.prm = param;
    }
}

function readPublicKey(): string {
    return tokenInfo.publicKey;
}

function readPrivateKey(): string {
    return tokenInfo.privateKey;
}

function encode(payload: JwtPayload): string {
    const cert = readPrivateKey();
    return sign({ ...payload }, cert, { algorithm: 'RS256' });
}

/**
 * This method checks the token and returns the decoded data when token is valid in all respect
 */
function validate(token: string): JwtPayload {
    const cert = readPublicKey();
    try {
        return verify(token, cert) as JwtPayload;
    } catch (e) {
        if (e instanceof JwtTokenExpiredError) {
            throw new TokenExpiredError();
        }
        // throws error if the token has not been encrypted by the private key
        throw new BadTokenError();
    }
}

/**
 * Returns the decoded payload if the signature is valid even if it is expired
 */
function decode(token: string): JwtPayload {
    const cert = readPublicKey();
    try {
        return verify(token, cert, {
            ignoreExpiration: true,
        }) as JwtPayload;
    } catch (_e) {
        throw new BadTokenError();
    }
}

export default {
    encode,
    validate,
    decode,
};
