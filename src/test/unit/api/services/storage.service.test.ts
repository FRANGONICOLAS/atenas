import { storageService } from "@/api/services/storage.service";

const uploadMock = jest.fn();
const getPublicUrlMock = jest.fn();
const removeMock = jest.fn();
const listMock = jest.fn();
const downloadMock = jest.fn();
const createBucketMock = jest.fn();
const deleteBucketMock = jest.fn();

const fromMock = jest.fn((_bucket?: string) => ({
  upload: uploadMock,
  getPublicUrl: getPublicUrlMock,
  remove: removeMock,
  list: listMock,
  download: downloadMock,
}));

jest.mock("@/api/supabase/client", () => ({
  client: {
    storage: {
      from: (bucket: string) => fromMock(bucket),
      createBucket: (...args: unknown[]) => createBucketMock(...args),
      deleteBucket: (...args: unknown[]) => deleteBucketMock(...args),
    },
  },
}));

describe("storageService", () => {
  const file = new File(["abc"], "test.png", { type: "image/png" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads file successfully", async () => {
    uploadMock.mockResolvedValueOnce({ data: { path: "a/b" }, error: null });

    const result = await storageService.uploadFile("images", "a/b", file, {
      upsert: true,
    });

    expect(fromMock).toHaveBeenCalledWith("images");
    expect(uploadMock).toHaveBeenCalledWith("a/b", file, { upsert: true });
    expect(result).toEqual({ path: "a/b" });
  });

  it("throws when upload fails", async () => {
    uploadMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Upload failed" },
    });

    await expect(
      storageService.uploadFile("images", "a/b", file),
    ).rejects.toMatchObject({
      message: "Upload failed",
    });
  });

  it("returns public url", () => {
    getPublicUrlMock.mockReturnValueOnce({
      data: { publicUrl: "https://cdn/x.png" },
    });

    const url = storageService.getPublicUrl("images", "x.png");

    expect(url).toBe("https://cdn/x.png");
  });

  it("deletes files", async () => {
    removeMock.mockResolvedValueOnce({
      data: [{ name: "x.png" }],
      error: null,
    });

    const result = await storageService.deleteFile("images", ["x.png"]);

    expect(removeMock).toHaveBeenCalledWith(["x.png"]);
    expect(result).toEqual([{ name: "x.png" }]);
  });

  it("throws when delete fails", async () => {
    removeMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Delete failed" },
    });

    await expect(
      storageService.deleteFile("images", ["x.png"]),
    ).rejects.toMatchObject({
      message: "Delete failed",
    });
  });

  it("lists files", async () => {
    listMock.mockResolvedValueOnce({ data: [{ name: "x.png" }], error: null });

    const result = await storageService.listFiles("images", "folder");

    expect(listMock).toHaveBeenCalledWith("folder");
    expect(result).toEqual([{ name: "x.png" }]);
  });

  it("throws when list fails", async () => {
    listMock.mockResolvedValueOnce({
      data: null,
      error: { message: "List failed" },
    });

    await expect(
      storageService.listFiles("images", "folder"),
    ).rejects.toMatchObject({
      message: "List failed",
    });
  });

  it("downloads file", async () => {
    const blob = new Blob(["hello"]);
    downloadMock.mockResolvedValueOnce({ data: blob, error: null });

    const result = await storageService.downloadFile("images", "x.png");

    expect(downloadMock).toHaveBeenCalledWith("x.png");
    expect(result).toBe(blob);
  });

  it("throws when download fails", async () => {
    downloadMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Download failed" },
    });

    await expect(
      storageService.downloadFile("images", "x.png"),
    ).rejects.toMatchObject({
      message: "Download failed",
    });
  });

  it("updates file by deleting old path then uploading new one", async () => {
    removeMock.mockResolvedValueOnce({ data: [], error: null });
    uploadMock.mockResolvedValueOnce({
      data: { path: "new.png" },
      error: null,
    });

    const result = await storageService.updateFile(
      "images",
      "old.png",
      file,
      "new.png",
    );

    expect(removeMock).toHaveBeenCalledWith(["old.png"]);
    expect(uploadMock).toHaveBeenCalledWith("new.png", file, { upsert: true });
    expect(result).toEqual({ path: "new.png" });
  });

  it("uses old path when update is called without newPath", async () => {
    removeMock.mockResolvedValueOnce({ data: [], error: null });
    uploadMock.mockResolvedValueOnce({
      data: { path: "old.png" },
      error: null,
    });

    const result = await storageService.updateFile("images", "old.png", file);

    expect(uploadMock).toHaveBeenCalledWith("old.png", file, { upsert: true });
    expect(result).toEqual({ path: "old.png" });
  });

  it("creates and deletes bucket", async () => {
    createBucketMock.mockResolvedValueOnce({
      data: { name: "images" },
      error: null,
    });
    deleteBucketMock.mockResolvedValueOnce({
      data: { name: "images" },
      error: null,
    });

    const created = await storageService.createBucket("images", {
      public: true,
    });
    const deleted = await storageService.deleteBucket("images");

    expect(created).toEqual({ name: "images" });
    expect(deleted).toEqual({ name: "images" });
  });

  it("throws when bucket operations fail", async () => {
    createBucketMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Create bucket failed" },
    });
    deleteBucketMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Delete bucket failed" },
    });

    await expect(storageService.createBucket("images")).rejects.toMatchObject({
      message: "Create bucket failed",
    });
    await expect(storageService.deleteBucket("images")).rejects.toMatchObject({
      message: "Delete bucket failed",
    });
  });
});
