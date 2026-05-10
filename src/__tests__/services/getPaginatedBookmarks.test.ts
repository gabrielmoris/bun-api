import { expect, test, describe, beforeAll } from "bun:test";
import {
  mockBookmarkModel,
  mockConnectDB,
  findMock,
  skipMock,
  limitMock,
  leanMock,
  countDocumentsMock,
} from "../mocks/db.mock";
import { mockedBookmarks } from "../mocks/bookmarks.mock";
import { getPaginatedBookmarks } from "../../services/getPaginatedBookmarks";

describe("Bookmarks creation", () => {
  beforeAll(() => {
    mockConnectDB();
    mockBookmarkModel();
  });

  test("It gets the all the bookmarks", async () => {
    leanMock.mockResolvedValueOnce(mockedBookmarks);
    countDocumentsMock.mockResolvedValueOnce(3);

    const result = await getPaginatedBookmarks(1, 10);

    expect(findMock).toHaveBeenCalledWith({});
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);

    expect(result).toMatchObject({
      total: 3,
      bookmarks: mockedBookmarks,
    });
  });

  test("It gets the first page with limit 1", async () => {
    leanMock.mockResolvedValueOnce([mockedBookmarks[0]]);
    countDocumentsMock.mockResolvedValueOnce(3);

    const result = await getPaginatedBookmarks(1, 1);

    expect(findMock).toHaveBeenCalledWith({});
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(1);

    expect(result).toMatchObject({
      total: 3,
      bookmarks: [mockedBookmarks[0]],
    });
  });

  test("It gets the second page with limit 1", async () => {
    leanMock.mockResolvedValueOnce([mockedBookmarks[1]]);
    countDocumentsMock.mockResolvedValueOnce(3);

    const result = await getPaginatedBookmarks(2, 1);

    expect(findMock).toHaveBeenCalledWith({});
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(1);

    expect(result).toMatchObject({
      total: 3,
      bookmarks: [mockedBookmarks[1]],
    });
  });

  test("Sends proper error structure when it fails", async () => {
    mockConnectDB(true);
    mockBookmarkModel();

    const result = await getPaginatedBookmarks(1, 1);

    expect(result).toEqual({
      error: {
        code: "UNKNOWN_ERROR",
        message: "Mocked DB Error",
        details: [
          {
            field: "unknown",
            message: "Unknown error happened retrieving Bookmarks",
          },
        ],
      },
    });
  });
});
