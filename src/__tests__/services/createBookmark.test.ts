import { expect, test, describe, beforeAll } from "bun:test";

import {
  createMock,
  findOneMock,
  mockBookmarkModel,
  mockConnectDB,
} from "../mocks/db.mock";
import { mockedBookmark } from "../mocks/bookmarks.mock";
const { createBookmark } = await import("../../services/createBookmark");

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
});
