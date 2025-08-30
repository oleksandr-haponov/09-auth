export interface User {
  id: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
