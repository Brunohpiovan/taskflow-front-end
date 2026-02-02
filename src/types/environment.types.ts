export interface Environment {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  boardsCount?: number;
  cardsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnvironmentDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateEnvironmentDTO extends Partial<CreateEnvironmentDTO> {}
