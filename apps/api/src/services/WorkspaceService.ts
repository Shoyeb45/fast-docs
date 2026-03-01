import DocRepo from '../database/repositories/DocRepo';
import FolderRepo from '../database/repositories/FolderRepo';

type Folder = Awaited<ReturnType<typeof FolderRepo.findManyByUserId>>[number];
type DocWithYjs = Awaited<ReturnType<typeof DocRepo.findManyByUserId>>[number];
type DocListItem = Omit<DocWithYjs, 'yjsState'>;

export interface WorkspaceData {
  folders: Folder[];
  docs: DocListItem[];
}

async function getWorkspace(userId: number): Promise<WorkspaceData> {
  const [folders, docs] = await Promise.all([
    FolderRepo.findManyByUserId(userId),
    DocRepo.findManyByUserId(userId),
  ]);
  return {
    folders,
    docs: docs.map(({ yjsState: _y, ...d }) => d),
  };
}

export default {
  getWorkspace,
};
