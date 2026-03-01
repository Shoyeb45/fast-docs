import z from 'zod';
import authSchema from '../auth/schema';

const docIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

const folderIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

const createDocBody = z.object({
  title: z.string().min(1).max(500),
  folderId: z.number().int().positive().nullable().optional(),
  content: z.string().optional(),
});

const updateDocBody = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  yjsState: z.string().optional(),
  folderId: z.number().int().positive().nullable().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

const createFolderBody = z.object({
  name: z.string().min(1).max(255),
  parentId: z.number().int().positive().nullable().optional(),
});

const updateFolderBody = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

const shareRole = z.enum(['editor', 'viewer', 'commenter']);

const createShareBody = z.object({
  userId: z.number().int().positive(),
  role: shareRole,
});

const updateShareBody = z.object({
  role: shareRole,
});

const shareLinkBody = z.object({
  shareForAll: z.boolean().optional(),
});

const shareIdParam = z.object({
  shareId: z.coerce.number().int().positive(),
});

const docIdShareIdParams = z.object({
  id: z.coerce.number().int().positive(),
  shareId: z.coerce.number().int().positive(),
});

export default {
  auth: authSchema.auth,
  docIdParam,
  folderIdParam,
  createDocBody,
  updateDocBody,
  createFolderBody,
  updateFolderBody,
  shareRole,
  createShareBody,
  updateShareBody,
  shareLinkBody,
  shareIdParam,
  docIdShareIdParams,
};
