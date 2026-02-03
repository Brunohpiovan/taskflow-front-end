export interface Board {
  id: string;
  slug: string;
  name: string;
  description?: string;
  position: number;
  environmentId: string;
  cardsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBoardDTO {
  name: string;
  description?: string;
  environmentId: string;
  position?: number;
}

export interface UpdateBoardDTO {
  name?: string;
  description?: string;
  position?: number;
}
