import { expect, test, describe, beforeAll, beforeEach } from "bun:test";

import { findBookmarkByUrlMock, createBookmarkInDbMock, delAllBookmarkListCachesMock, mockBookmarkRepository, mockCache } from "../mocks/db.mock";
import { mockedBookmark, mockedBookmarks } from "../mocks/bookmarks.mock";
import { createBookmark } from "../../services/createBookmark";

describe("Bookmarks creation", () => {
  beforeAll(() => {
    mockBookmarkRepository();
    mockCache();
  });

  beforeEach(() => {
    findBookmarkByUrlMock.mockClear();
    createBookmarkInDbMock.mockClear();
    delAllBookmarkListCachesMock.mockClear();
  });

  test("It doesn't create bookmark if the DB already has a bookmark", async () => {
    findBookmarkByUrlMock.mockReturnValueOnce(mockedBookmarks[0]);

    const result = await createBookmark(mockedBookmark);

    expect(findBookmarkByUrlMock).toHaveBeenCalledWith(mockedBookmark.url);
    expect(createBookmarkInDbMock).not.toHaveBeenCalled();
    expect(result.error?.code).toBe("DUPLICATED_ENTRY");
  });

  test("It creates a bookmark if the bookmark is not in the DB", async () => {
    // Setup: simulate no bookmark found
    findBookmarkByUrlMock.mockReturnValueOnce(null);
    createBookmarkInDbMock.mockReturnValueOnce({
      ...mockedBookmark,
      id: 999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const result = await createBookmark(mockedBookmark);

    expect(findBookmarkByUrlMock).toHaveBeenCalledWith(mockedBookmark.url);
    expect(createBookmarkInDbMock).toHaveBeenCalled();
    expect(delAllBookmarkListCachesMock).toHaveBeenCalled();
    expect(result.data?.url).toBe(mockedBookmark.url);
  });

  test("Sends proper error structure when it fails", async () => {
    findBookmarkByUrlMock.mockReturnValueOnce(null);
    createBookmarkInDbMock.mockImplementation(() => {
      throw new Error("Mocked DB Error");
    });

    const result = await createBookmark(mockedBookmark);

    expect(result).toMatchObject({
      error: {
        code: "UNKNOWN_ERROR",
        message: "Mocked DB Error",
        details: [
          {
            field: "unknown",
            message: "Unknown error happened saving a Bookmark",
          },
        ],
      },
    });
  });
});
