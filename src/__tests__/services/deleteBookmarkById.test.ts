import { expect, test, describe, beforeAll, beforeEach, mock } from "bun:test";
import { mockedBookmarks } from "../mocks/bookmarks.mock";
import { deleteBookmarkById } from "../../services/deleteBookmarkById";
import { mockCache } from "../mocks/redis.mock";
import { deleteBookmarkMock, mockBookmarkRepository } from "../mocks/db.mock";

describe("Bookmarks creation", () => {
  beforeAll(() => {
    mockBookmarkRepository();
    mockCache();
  });

  beforeEach(() => {
    mock.clearAllMocks();
  });

  test("It deletes a Bookmark by ID", async () => {
    const result = await deleteBookmarkById(999);
    const oldBookmark = { ...mockedBookmarks[0] };

    expect(deleteBookmarkMock).toHaveBeenCalledWith(999);

    expect(result).toMatchObject({
      bookmark: oldBookmark,
    });
  });

  test("It fails with the proper error if the ID is not valid", async () => {
    const result = await deleteBookmarkById("sorry" as unknown as number);

    expect(deleteBookmarkMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      error: {
        code: "INVALID_ID",
        message: "The bookmark id provided is invalid",
        details: [
          {
            field: "id",
            message: "Expected a valid positive integer ID",
          },
        ],
      },
    });
  });

  test("Sends proper error when there is no Bookmark with that ID", async () => {
    const result = await deleteBookmarkById(999);

    expect(deleteBookmarkMock).toHaveBeenCalledWith(999);

    expect(result).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "This bookmark could not be found",
        details: [
          {
            field: "id",
            message: "No bookmark with id 69fcf6c34eb330810c7f6d6d",
          },
        ],
      },
    });
  });
});
