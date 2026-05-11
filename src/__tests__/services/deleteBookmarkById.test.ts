import { expect, test, describe, beforeAll, beforeEach, mock } from "bun:test";
import {
  mockBookmarkModel,
  mockConnectDB,
  deleteOneMock,
} from "../mocks/db.mock";
import { mockedBookmarks } from "../mocks/bookmarks.mock";
import { deleteBookmarkById } from "../../services/deleteBookmarkById";

describe("Bookmarks creation", () => {
  beforeAll(() => {
    mockConnectDB();
    mockBookmarkModel();
  });

  beforeEach(() => {
    mock.clearAllMocks();
  });

  test("It deletes a Bookmark by ID", async () => {
    const result = await deleteBookmarkById("69fcf6c34eb330810c7f6d8d");
    const oldBookmark = { ...mockedBookmarks[0] };

    expect(deleteOneMock).toHaveBeenCalledWith({
      _id: "69fcf6c34eb330810c7f6d8d",
    });

    expect(result).toMatchObject({
      bookmark: oldBookmark,
    });
  });

  test("It fails with the proper error if the ID is not valid", async () => {
    const result = await deleteBookmarkById("69fcf6c34eb330810c7f6d8ds");

    expect(deleteOneMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      error: {
        code: "INVALID_ID",
        message: "The bookmark id provided is invalid",
        details: [
          {
            field: "id",
            message: "Expected a valid MongoDB ObjectId",
          },
        ],
      },
    });
  });

  test("Sends proper error when there is no Bookmark with that ID", async () => {
    const result = await deleteBookmarkById("69fcf6c34eb330810c7f6d6d");

    expect(deleteOneMock).toHaveBeenCalledWith({
      _id: "69fcf6c34eb330810c7f6d6d",
    });

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
