import { Request, Response, NextFunction } from 'express';
import { getAccessToken, validateTokenData } from '../../core/authUtils.js';
import jwtUtils from '../../core/jwtUtils.js';
import UserRepo from '../../database/repositories/UserRepo.js';
import KeystoreRepo from '../../database/repositories/KeyStoreRepo.js';
import type { ProtectedRequest } from '../../types/app-requests.js';

/**
 * Optional authentication: if Bearer token in header or token in query, validate and set req.user.
 * Otherwise next() without setting user. Never rejects (so public share links can work).
 */
function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : queryToken;

  if (!token) {
    (req as Partial<ProtectedRequest>).user = undefined;
    return next();
  }

  const run = async () => {
    try {
      const payload = jwtUtils.validate(token);
      validateTokenData(payload);
      const userId = parseInt(payload.sub, 10);
      if (isNaN(userId)) return next();
      const user = await UserRepo.findById(userId);
      if (!user) return next();
      const keystore = await KeystoreRepo.findForKey(user.id, payload.prm);
      if (!keystore) return next();
      (req as ProtectedRequest).user = user;
      (req as ProtectedRequest).accessToken = token;
      (req as ProtectedRequest).keystore = keystore;
    } catch (_e) {
      // Do not fail - let requireDocAccess or other middleware handle missing auth
    }
    next();
  };
  run().catch(next);
}

export default optionalAuth;
