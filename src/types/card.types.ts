export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  boardId: string;
  labels?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardDTO {
  title: string;
  description?: string;
  boardId: string;
  position?: number;
  labels?: string[];
  dueDate?: string;
}

export interface UpdateCardDTO {
  title?: string;
  description?: string;
  position?: number;
  labels?: string[];
  dueDate?: string;
}

export interface MoveCardDTO {
  targetBoardId: string;
  newPosition: number;
}
