export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  actorId: string;
  actor: string;
  message: string;
  createdAt: string;
}
