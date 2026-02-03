export interface Environment {
  id: string;
  slug: string;
  name: string;
  description?: string;
  boardsCount?: number;
  cardsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnvironmentDTO {
  name: string;
  description?: string;
}

export type UpdateEnvironmentDTO = Partial<CreateEnvironmentDTO>;
