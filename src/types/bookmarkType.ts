export interface IBookmark {
  id: number;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RawBookmark extends Omit<IBookmark, 'tags'> {
  tags: string;
}

export interface IDeletedBookmark {
  deletedCount: number;
  id: number;
}
