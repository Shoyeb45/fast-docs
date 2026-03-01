export type Token = {
    refreshToken: string | null,
    accessToken: string | null
}

export interface User {
  id: number;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  githubId: number;
  githubUsername: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}