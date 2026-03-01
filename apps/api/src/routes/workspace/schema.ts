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

export default {
  auth: authSchema.auth,
  docIdParam,
  folderIdParam,
  createDocBody,
  updateDocBody,
  createFolderBody,
  updateFolderBody,
};
