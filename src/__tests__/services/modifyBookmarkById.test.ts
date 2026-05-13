import { expect, test, describe, beforeAll, beforeEach, mock } from "bun:test";
import {
  mockBookmarkModel,
  mockConnectDB,
  findByIdAndUpdateMock,
} from "../mocks/db.mock";
import { mockedBookmarks } from "../mocks/bookmarks.mock";
import { modifyBookmarkById } from "../../services/modifyBookmarkById";
import { mockCache } from "../mocks/redis.mock";

const bookmarkToModify = {
  url: "http://i-am-modified.com",
};

describe("Bookmarks creation", () => {
  beforeAll(() => {
    mockConnectDB();
    mockBookmarkModel();
    mockCache();
  });

  beforeEach(() => {
    mock.clearAllMocks();
  });

  test("It modifies a Bookmark by ID", async () => {
    const result = await modifyBookmarkById(
      "69fcf6c34eb330810c7f6d8d",
      bookmarkToModify,
    );
    const oldBookmark = { ...mockedBookmarks[0] };

    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "69fcf6c34eb330810c7f6d8d",
      bookmarkToModify,
      {
        new: true,
        runValidators: true,
      },
    );

    expect(result).toMatchObject({
      bookmark: { ...oldBookmark, url: "http://i-am-modified.com" },
    });
  });

  test("It fails with the proper error if the ID is not valid", async () => {
    const result = await modifyBookmarkById(
      "69fcf6c34eb330810c7f6d8ds",
      bookmarkToModify,
    );

    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();

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
    const result = await modifyBookmarkById(
      "69fcf6c34eb330810c7f6d6d",
      bookmarkToModify,
    );

    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "69fcf6c34eb330810c7f6d6d",
      bookmarkToModify,
      {
        new: true,
        runValidators: true,
      },
    );

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
