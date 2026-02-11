export interface Label {
  id: string;
  name: string;
  color: string;
  environmentId: string;
}

export interface CardMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  assignedAt: string;
}

// Minimal types for list view (optimized payload)
export interface CardMemberMinimal {
  avatar?: string;
}

export interface LabelMinimal {
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  position: number;
  boardId: string;
  labels?: Label[] | LabelMinimal[]; // Full for detail, minimal for list
  members?: CardMember[] | CardMemberMinimal[]; // Full for detail, minimal for list
  dueDate?: string;
  createdAt?: string;

}

export interface CreateCardDTO {
  title: string;
  description?: string;
  boardId: string;
  position?: number;
  labels?: string[]; // IDs of labels
  dueDate?: string;
}

export interface UpdateCardDTO {
  title?: string;
  description?: string;
  position?: number;
  labels?: string[]; // IDs of labels
  dueDate?: string;
  completed?: boolean;
}

export interface MoveCardDTO {
  targetBoardId: string;
  newPosition: number;
}

/** Resposta mínima do PATCH /cards/:id/move */
export interface MoveCardResponse {
  id: string;
  boardId: string;
  position: number;
}
