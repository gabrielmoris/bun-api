import { mock } from "bun:test";
import { mockedBookmarks } from "./bookmarks.mock";

export const mockConnectDB = (shouldFail = false) =>
  mock.module("../../db/mongo.ts", () => ({
    connectDB: shouldFail
      ? mock(async () => {
          throw new Error("Mocked DB Error");
        })
      : connectDBMock,
  }));

export const connectDBMock = mock(async () => ({ fake: "connection" }));
export const findOneMock = mock(async (_query: any): Promise<any> => null);
export const leanMock = mock((): Promise<any[]> => Promise.resolve([]));
export const limitMock = mock((_limit: number) => ({ lean: leanMock }));
export const skipMock = mock((_skip: number) => ({ limit: limitMock }));
export const sortMock = mock((_sort: any) => ({ skip: skipMock }));
export const findMock = mock((_query: any) => ({ sort: sortMock }));
export const findByIdMock = mock(async (id: string): Promise<any> => {
  return mockedBookmarks.find((b) => b._id === id) ?? null;
});

export const countDocumentsMock = mock(async () => 3);

export const createMock = mock(async (bookmark: any) => ({
  _id: "fake-id-123",
  ...bookmark,
}));

export const mockBookmarkModel = () =>
  mock.module("../../db/bookmarkModel", () => ({
    default: {
      findOne: findOneMock,
      create: createMock,
      find: findMock,
      countDocuments: countDocumentsMock,
      findById: findByIdMock,
    },
  }));
