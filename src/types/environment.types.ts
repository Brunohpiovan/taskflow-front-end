export interface EnvironmentMember {
  id: string;
  environmentId?: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  name: string;
  email: string;
  avatar?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Invite {
  id: string;
  environmentId: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  expiresAt: string;
}

export interface Environment {
  id: string;
  slug: string;
  name: string;
  description?: string;
  boardsCount?: number;
  cardsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  members?: EnvironmentMember[];
}

export interface CreateEnvironmentDTO {
  name: string;
  description?: string;
}

export type UpdateEnvironmentDTO = Partial<CreateEnvironmentDTO>;
