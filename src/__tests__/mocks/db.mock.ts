import { mock } from "bun:test";

export const mockConnectDB = (shouldFail = false) =>
  mock.module("../../db/mongo.ts", () => ({
    connectDB: shouldFail
      ? mock(async () => {
          throw new Error("Mocked DB Error");
        })
      : mock(async () => ({ fake: "connection" })),
  }));

export const findOneMock = mock(async (_query: any): Promise<any> => null);

export const createMock = mock(async (bookmark: any) => ({
  _id: "fake-id-123",
  ...bookmark,
}));

export const mockBookmarkModel = () =>
  mock.module("../../db/bookmarkModel", () => ({
    default: {
      findOne: findOneMock,
      create: createMock,
    },
  }));
