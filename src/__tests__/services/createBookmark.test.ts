import { expect, test, describe, beforeAll } from "bun:test";

import {
  createMock,
  findOneMock,
  mockBookmarkModel,
  mockConnectDB,
} from "../mocks/db.mock";
import { mockedBookmark } from "../mocks/bookmarks.mock";
import { createBookmark } from "../../services/createBookmark";

describe("Bookmarks creation", () => {
  beforeAll(() => {
    mockConnectDB();
    mockBookmarkModel();
  });

  test("It doesn't create bookmark if the DB already has a bookmark", async () => {
    findOneMock.mockResolvedValueOnce({
      _id: "existing-id",
      ...mockedBookmark,
    });

    const result = await createBookmark(mockedBookmark);

    expect(findOneMock).toHaveBeenCalledWith({ url: mockedBookmark.url });
    expect(createMock).not.toHaveBeenCalled();
    expect(result.error?.code).toBe("DUPLICATED_ENTRY");
  });

  test("It creates a bookmark if the bookmark is not in the DB", async () => {
    findOneMock.mockResolvedValueOnce(null);

    const result = await createBookmark(mockedBookmark);
    expect(findOneMock).toHaveBeenCalledWith({ url: mockedBookmark.url });
    expect(createMock).toHaveBeenCalled();
    expect(result).toMatchObject({
      data: { ...mockedBookmark, _id: "fake-id-123" },
    });
  });

  test("Sends proper error structure when it fails", async () => {
    const failConnection = true;
    mockConnectDB(failConnection);
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
