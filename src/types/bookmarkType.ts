export interface RawBookmark {
  id: number;
  url: string;
  title: string;
  description?: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface IBookmark {
  id: number;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
