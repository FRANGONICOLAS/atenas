import { headquarterService } from "@/api/services/headquarter.service";
import { supabaseError, supabaseOk } from "@/test/mocks/supabase.mock";
import { storageService } from "@/api/services/storage.service";

jest.mock("@/api/supabase/client", () => ({
  client: {
    from: jest.fn(),
  },
}));

jest.mock("@/api/services/storage.service", () => ({
  storageService: {
    uploadFile: jest.fn(),
    getPublicUrl: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

type QueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  ilike: jest.Mock;
  order: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
};

function createBuilder(): QueryBuilder {
  const builder = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    ilike: jest.fn(),
    order: jest.fn(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.ilike.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("headquarterService unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("gets all headquarters", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(
      supabaseOk([{ headquarters_id: "hq-1", name: "Norte" }]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await headquarterService.getAll();

    expect(result).toHaveLength(1);
  });

  it("returns empty list when getAll has null data", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(headquarterService.getAll()).resolves.toEqual([]);
  });

  it("gets headquarter by id", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce(
      supabaseOk({ headquarters_id: "hq-1", name: "Norte" }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await headquarterService.getById("hq-1");

    expect(result?.headquarters_id).toBe("hq-1");
  });

  it("returns null when getById has no data", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(headquarterService.getById("hq-x")).resolves.toBeNull();
  });

  it("throws when getById fails", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce(supabaseError("GetById failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(headquarterService.getById("hq-x")).rejects.toMatchObject({
      message: "GetById failed",
    });
  });

  it("gets by director and by status", async () => {
    const byDirectorBuilder = createBuilder();
    byDirectorBuilder.order.mockResolvedValueOnce(
      supabaseOk([{ headquarters_id: "hq-1" }]),
    );

    const byStatusBuilder = createBuilder();
    byStatusBuilder.order.mockResolvedValueOnce(
      supabaseOk([{ headquarters_id: "hq-2" }]),
    );

    clientMock.from
      .mockImplementationOnce(() => byDirectorBuilder)
      .mockImplementationOnce(() => byStatusBuilder);

    const byDirector = await headquarterService.getByDirectorId("u-1");
    const byStatus = await headquarterService.getByStatus("active");

    expect(byDirector[0].headquarters_id).toBe("hq-1");
    expect(byStatus[0].headquarters_id).toBe("hq-2");
  });

  it("returns empty arrays when getByDirectorId/getByStatus have null data", async () => {
    const byDirectorBuilder = createBuilder();
    byDirectorBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const byStatusBuilder = createBuilder();
    byStatusBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => byDirectorBuilder)
      .mockImplementationOnce(() => byStatusBuilder);

    await expect(headquarterService.getByDirectorId("u-1")).resolves.toEqual(
      [],
    );
    await expect(headquarterService.getByStatus("active")).resolves.toEqual([]);
  });

  it("throws when getByDirectorId/getByStatus fail", async () => {
    const byDirectorBuilder = createBuilder();
    byDirectorBuilder.order.mockResolvedValueOnce(
      supabaseError("Director list failed"),
    );

    const byStatusBuilder = createBuilder();
    byStatusBuilder.order.mockResolvedValueOnce(
      supabaseError("Status list failed"),
    );

    clientMock.from
      .mockImplementationOnce(() => byDirectorBuilder)
      .mockImplementationOnce(() => byStatusBuilder);

    await expect(
      headquarterService.getByDirectorId("u-1"),
    ).rejects.toMatchObject({ message: "Director list failed" });
    await expect(
      headquarterService.getByStatus("active"),
    ).rejects.toMatchObject({ message: "Status list failed" });
  });

  it("creates and updates headquarter", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce(
      supabaseOk({ headquarters_id: "hq-3", name: "Nueva" }),
    );

    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({ headquarters_id: "hq-3", name: "Nueva 2" }),
    );

    clientMock.from
      .mockImplementationOnce(() => createBuilderLocal)
      .mockImplementationOnce(() => updateBuilder);

    const created = await headquarterService.create({
      name: "Nueva",
      user_id: "u-1",
    });

    const updated = await headquarterService.update("hq-3", {
      name: "Nueva 2",
    });

    expect(created.headquarters_id).toBe("hq-3");
    expect(updated.name).toBe("Nueva 2");
  });

  it("throws when create/update/delete fail", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce(
      supabaseError("Create failed"),
    );

    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(supabaseError("Update failed"));

    const deleteBuilder = createBuilder();
    deleteBuilder.eq.mockResolvedValueOnce(supabaseError("Delete failed"));

    clientMock.from
      .mockImplementationOnce(() => createBuilderLocal)
      .mockImplementationOnce(() => updateBuilder)
      .mockImplementationOnce(() => deleteBuilder);

    await expect(
      headquarterService.create({ name: "X", user_id: "u-1" }),
    ).rejects.toMatchObject({ message: "Create failed" });

    await expect(
      headquarterService.update("hq", { name: "X" }),
    ).rejects.toMatchObject({ message: "Update failed" });

    await expect(headquarterService.delete("hq")).rejects.toMatchObject({
      message: "Delete failed",
    });
  });

  it("counts beneficiaries and falls back to zero when count is null", async () => {
    const builder1 = createBuilder();
    builder1.eq.mockResolvedValueOnce({ count: 3, error: null });

    const builder2 = createBuilder();
    builder2.eq.mockResolvedValueOnce({ count: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => builder1)
      .mockImplementationOnce(() => builder2);

    await expect(headquarterService.getBeneficiaryCount("hq-1")).resolves.toBe(
      3,
    );
    await expect(headquarterService.getBeneficiaryCount("hq-2")).resolves.toBe(
      0,
    );
  });

  it("throws when getBeneficiaryCount fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("Count failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      headquarterService.getBeneficiaryCount("hq-1"),
    ).rejects.toMatchObject({
      message: "Count failed",
    });
  });

  it("gets projects and returns empty list with null data", async () => {
    const builder1 = createBuilder();
    builder1.eq.mockResolvedValueOnce(
      supabaseOk([{ project: { project_id: "p-1" } }]),
    );

    const builder2 = createBuilder();
    builder2.eq.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => builder1)
      .mockImplementationOnce(() => builder2);

    await expect(headquarterService.getProjects("hq-1")).resolves.toHaveLength(
      1,
    );
    await expect(headquarterService.getProjects("hq-2")).resolves.toEqual([]);
  });

  it("throws when getProjects fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("Projects failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(headquarterService.getProjects("hq-1")).rejects.toMatchObject({
      message: "Projects failed",
    });
  });

  it("assigns and unassigns project", async () => {
    const assignBuilder = createBuilder();
    assignBuilder.insert.mockResolvedValueOnce({ error: null });

    const unassignBuilder = createBuilder();
    unassignBuilder.eq
      .mockImplementationOnce(() => unassignBuilder)
      .mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => assignBuilder)
      .mockImplementationOnce(() => unassignBuilder);

    await expect(
      headquarterService.assignProject("hq-1", "p-1"),
    ).resolves.toBeUndefined();
    await expect(
      headquarterService.unassignProject("hq-1", "p-1"),
    ).resolves.toBeUndefined();
  });

  it("throws when assignProject/unassignProject fail", async () => {
    const assignBuilder = createBuilder();
    assignBuilder.insert.mockResolvedValueOnce(supabaseError("Assign failed"));

    const unassignBuilder = createBuilder();
    unassignBuilder.eq
      .mockImplementationOnce(() => unassignBuilder)
      .mockResolvedValueOnce(supabaseError("Unassign failed"));

    clientMock.from
      .mockImplementationOnce(() => assignBuilder)
      .mockImplementationOnce(() => unassignBuilder);

    await expect(
      headquarterService.assignProject("hq-1", "p-1"),
    ).rejects.toMatchObject({ message: "Assign failed" });

    await expect(
      headquarterService.unassignProject("hq-1", "p-1"),
    ).rejects.toMatchObject({ message: "Unassign failed" });
  });

  it("searches headquarters by name", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(
      supabaseOk([{ headquarters_id: "hq-1", name: "Norte" }]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await headquarterService.searchByName("Nor");

    expect(builder.ilike).toHaveBeenCalledWith("name", "%Nor%");
    expect(result).toHaveLength(1);
  });

  it("returns empty list when searchByName has null data", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(headquarterService.searchByName("Nor")).resolves.toEqual([]);
  });

  it("throws when searchByName fails", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(supabaseError("Search failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(headquarterService.searchByName("Nor")).rejects.toMatchObject({
      message: "Search failed",
    });
  });

  it("uploads image and returns public url", async () => {
    const uploadFileMock = storageService.uploadFile as jest.Mock;
    const getPublicUrlMock = storageService.getPublicUrl as jest.Mock;

    uploadFileMock.mockResolvedValueOnce({ path: "headquarter/x.png" });
    getPublicUrlMock.mockReturnValueOnce("https://cdn.test/hq.png");

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    const url = await headquarterService.uploadImage("hq-1", file);

    expect(uploadFileMock).toHaveBeenCalled();
    expect(url).toBe("https://cdn.test/hq.png");
  });

  it("updateImage deletes old file when possible and uploads new file", async () => {
    const deleteFileMock = storageService.deleteFile as jest.Mock;
    const uploadSpy = jest
      .spyOn(headquarterService, "uploadImage")
      .mockResolvedValueOnce("https://cdn.test/new.png");

    deleteFileMock.mockResolvedValueOnce(undefined);

    const file = new File(["x"], "avatar.png", { type: "image/png" });

    const result = await headquarterService.updateImage(
      "hq-1",
      file,
      "https://storage.test/atenas-gallery/headquarter/old.png",
    );

    expect(deleteFileMock).toHaveBeenCalledWith("atenas-gallery", [
      "headquarter/old.png",
    ]);
    expect(uploadSpy).toHaveBeenCalledWith("hq-1", file);
    expect(result).toBe("https://cdn.test/new.png");
  });

  it("updateImage continues when deleting old image fails", async () => {
    const deleteFileMock = storageService.deleteFile as jest.Mock;
    const uploadSpy = jest
      .spyOn(headquarterService, "uploadImage")
      .mockResolvedValueOnce("https://cdn.test/new2.png");

    deleteFileMock.mockRejectedValueOnce(new Error("delete failed"));

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    const result = await headquarterService.updateImage(
      "hq-1",
      file,
      "https://storage.test/atenas-gallery/headquarter/old2.png",
    );

    expect(result).toBe("https://cdn.test/new2.png");
    expect(uploadSpy).toHaveBeenCalled();
  });

  it("updateImage uploads directly when oldImageUrl is not provided", async () => {
    const deleteFileMock = storageService.deleteFile as jest.Mock;
    const uploadSpy = jest
      .spyOn(headquarterService, "uploadImage")
      .mockResolvedValueOnce("https://cdn.test/new3.png");

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    const result = await headquarterService.updateImage("hq-1", file);

    expect(deleteFileMock).not.toHaveBeenCalled();
    expect(uploadSpy).toHaveBeenCalledWith("hq-1", file);
    expect(result).toBe("https://cdn.test/new3.png");
  });

  it("deletes image path extracted from URL", async () => {
    const deleteFileMock = storageService.deleteFile as jest.Mock;
    deleteFileMock.mockResolvedValueOnce(undefined);

    await expect(
      headquarterService.deleteImage(
        "https://storage.test/atenas-gallery/headquarter/remove.png",
      ),
    ).resolves.toBeUndefined();

    expect(deleteFileMock).toHaveBeenCalledWith("atenas-gallery", [
      "headquarter/remove.png",
    ]);
  });

  it("throws when deleteImage fails", async () => {
    const deleteFileMock = storageService.deleteFile as jest.Mock;
    deleteFileMock.mockRejectedValueOnce(new Error("delete img failed"));

    await expect(
      headquarterService.deleteImage(
        "https://storage.test/atenas-gallery/headquarter/remove.png",
      ),
    ).rejects.toMatchObject({
      message: "delete img failed",
    });
  });

  it("deleteImage does nothing when url has no bucket segment", async () => {
    const deleteFileMock = storageService.deleteFile as jest.Mock;

    await expect(
      headquarterService.deleteImage(
        "https://storage.test/other-bucket/file.png",
      ),
    ).resolves.toBeUndefined();

    expect(deleteFileMock).not.toHaveBeenCalled();
  });
});
