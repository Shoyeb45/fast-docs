import DocRepo from '../database/repositories/DocRepo';
import FolderRepo from '../database/repositories/FolderRepo';

export interface WorkspaceData {
  folders: Awaited<ReturnType<typeof FolderRepo.findManyByUserId>>;
  docs: Awaited<ReturnType<typeof DocRepo.findManyByUserId>>;
}

async function getWorkspace(userId: number): Promise<WorkspaceData> {
  const [folders, docs] = await Promise.all([
    FolderRepo.findManyByUserId(userId),
    DocRepo.findManyByUserId(userId),
  ]);
  return { folders, docs };
}

export default {
  getWorkspace,
};
