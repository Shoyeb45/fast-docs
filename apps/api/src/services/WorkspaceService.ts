import DocRepo from '../database/repositories/DocRepo';
import DocShareRepo from '../database/repositories/DocShareRepo';
import FolderRepo from '../database/repositories/FolderRepo';

type Folder = Awaited<ReturnType<typeof FolderRepo.findManyByUserId>>[number];
type DocWithYjs = Awaited<ReturnType<typeof DocRepo.findManyByUserId>>[number];
type DocListItem = Omit<DocWithYjs, 'yjsState'>;

export interface SharedWithMeItem {
  id: number;
  title: string;
  role: 'editor' | 'viewer' | 'commenter';
  ownerName: string;
}

export interface WorkspaceData {
  folders: Folder[];
  docs: DocListItem[];
  sharedWithMe: SharedWithMeItem[];
}

async function getWorkspace(userId: number): Promise<WorkspaceData> {
  const [folders, docs, shares] = await Promise.all([
    FolderRepo.findManyByUserId(userId),
    DocRepo.findManyByUserId(userId),
    DocShareRepo.findManyByUserIdWithDoc(userId),
  ]);
  const sharedWithMe: SharedWithMeItem[] = shares.map((s) => ({
    id: s.doc.id,
    title: s.doc.title,
    role: s.role as SharedWithMeItem['role'],
    ownerName: s.doc.user?.name ?? 'Unknown',
  }));
  return {
    folders,
    docs: docs.map(({ yjsState: _y, ...d }) => d),
    sharedWithMe,
  };
}

export default {
  getWorkspace,
};
