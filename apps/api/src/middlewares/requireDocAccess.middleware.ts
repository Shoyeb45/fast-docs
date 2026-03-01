import { Response, NextFunction } from 'express';
import { asyncHandler } from '../core/asyncHandler';
import DocAccessService from '../services/DocAccessService';
import { AuthFailureError, ForbiddenError } from '../core/ApiError';
import type { DocAccessRequest } from '../types/app-requests';
import type { DocRole } from '../services/DocAccessService';

export interface RequireDocAccessOptions {
  /** Minimum role required (owner > editor > commenter > viewer). Default: any role. */
  minRole?: DocRole;
  /** If true, allow unauthenticated access when shareToken is in query (viewer only). */
  allowPublicShare?: boolean;
}

/**
 * Resolves doc access from params.id and optional query.shareToken.
 * Sets req.doc and req.docRole. Use after authentication (or optionalAuth for allowPublicShare).
 */
export function requireDocAccess(options: RequireDocAccessOptions = {}) {
  const { minRole, allowPublicShare = false } = options;

  return asyncHandler(async (req: DocAccessRequest, _res, next: NextFunction) => {
    const rawId = req.params.id;
    const docId =
      rawId != null && Number.isInteger(Number(rawId)) && Number(rawId) > 0
        ? Number(rawId)
        : undefined;
    const shareToken =
      typeof req.query.shareToken === 'string' ? req.query.shareToken : undefined;

    const userId = req.user?.id ?? null;

    if (allowPublicShare && shareToken && userId == null) {
      const result = await DocAccessService.getDocWithAccess(null, { shareToken });
      if (!result) throw new AuthFailureError('Invalid or expired share link');
      req.doc = result.doc;
      req.docRole = result.role;
      if (minRole && !DocAccessService.hasMinimumRole(result.role, minRole)) {
        throw new ForbiddenError('You do not have permission to perform this action');
      }
      return next();
    }

    if (userId == null) {
      throw new AuthFailureError('Authentication required');
    }

    if (docId == null && !shareToken) {
      throw new ForbiddenError('Document not found');
    }

    const result = await DocAccessService.requireDocWithAccess(userId, {
      docId: docId ?? undefined,
      shareToken,
    });
    req.doc = result.doc;
    req.docRole = result.role;

    if (minRole && !DocAccessService.hasMinimumRole(result.role, minRole)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  });
}
