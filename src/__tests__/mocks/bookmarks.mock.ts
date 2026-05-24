import type { IBookmark } from "../../types/bookmarkType";

export const mockedCreateBookmark: Partial<IBookmark> = {
  url: "https://www.test.com",
  title: "test",
  description: "test description",
  tags: ["test-tag-1", "test-tag-2"],
  created_at: "2026-05-23 11:51:18",
  updated_at: "2026-05-23 11:51:36",
};

export const mockedBookmarks: IBookmark[] = [
  {
    id: 1,
    url: "https://www.test1.com",
    title: "test1",
    description: "test description 1",
    tags: ["test-tag-1"],
    created_at: "2026-05-23 11:51:18",
    updated_at: "2026-05-23 11:51:36",
  },
  {
    id: 2,
    url: "https://www.test2.com",
    title: "test2",
    description: "test description 2",
    tags: ["test-tag-1", "test-tag-2"],
    created_at: "2026-05-24 13:36:27",
    updated_at: "2026-05-24 13:36:41",
  },
  {
    id: 3,
    url: "https://www.test3.com 3",
    title: "test3",
    description: "test description",
    tags: ["test-tag-1", "test-tag-2", "test-tag-3"],
    created_at: "2026-05-25 08:22:22",
    updated_at: "2026-05-25 08:22:22",
  },
];
