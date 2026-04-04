import { contentService } from "@/api/services/content.service";
import { supabaseError, supabaseOk } from "@/test/mocks/supabase.mock";
import { storageService } from "@/api/services/storage.service";

jest.mock("@/api/supabase/client", () => ({
  client: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
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
  in: jest.Mock;
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
    in: jest.fn(),
    order: jest.fn(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
    auth: {
      getUser: jest.Mock;
    };
  };
};

describe("contentService unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storageService.getPublicUrl as jest.Mock).mockImplementation(
      (bucket: string, path: string) => `https://cdn.test/${bucket}/${path}`,
    );
  });

  it("gets active contents with public URLs", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          content_id: "c-1",
          content_key: "home_hero",
          bucket_path: "sites-content/home/home_hero/hero.png",
          is_active: true,
        },
      ]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await contentService.getActiveContents();

    expect(result).toHaveLength(1);
    expect(result[0].public_url).toContain("atenas-gallery");
  });

  it("returns null when getContentByKey has no active record", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      contentService.getContentByKey("home_missing"),
    ).resolves.toBeNull();
  });

  it("gets content by key with public URL", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce(
      supabaseOk({
        content_id: "c-by-key",
        content_key: "home_hero",
        bucket_path: "sites-content/home/home_hero/key.png",
        is_active: true,
      }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await contentService.getContentByKey("home_hero");

    expect(result?.content_id).toBe("c-by-key");
    expect(result?.public_url).toContain("atenas-gallery");
  });

  it("throws when getContentByKey fails", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce(supabaseError("getByKey failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      contentService.getContentByKey("home_hero"),
    ).rejects.toMatchObject({
      message: "getByKey failed",
    });
  });

  it("returns empty array on getContentsByKeys when keys are empty", async () => {
    await expect(contentService.getContentsByKeys([])).resolves.toEqual([]);
    expect(clientMock.from).not.toHaveBeenCalled();
  });

  it("gets all contents and contents by section", async () => {
    const allBuilder = createBuilder();
    allBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          content_id: "c-all-1",
          content_key: "about_banner",
          bucket_path: "sites-content/about/about_banner/b.png",
        },
      ]),
    );

    const sectionBuilder = createBuilder();
    sectionBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          content_id: "c-sec-1",
          content_key: "home_hero",
          bucket_path: "sites-content/home/home_hero/h.png",
          is_active: true,
        },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => allBuilder)
      .mockImplementationOnce(() => sectionBuilder);

    const all = await contentService.getAllContents();
    const bySection = await contentService.getContentsBySection("home");

    expect(all[0].content_id).toBe("c-all-1");
    expect(bySection[0].content_id).toBe("c-sec-1");
  });

  it("gets contents by keys", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(
      supabaseOk([
        {
          content_id: "c-k-1",
          content_key: "home_hero",
          bucket_path: "sites-content/home/home_hero/h.png",
          is_active: true,
        },
      ]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await contentService.getContentsByKeys(["home_hero"]);

    expect(result).toHaveLength(1);
    expect(builder.in).toHaveBeenCalledWith("content_key", ["home_hero"]);
  });

  it("throws when read operations fail", async () => {
    const getAllBuilder = createBuilder();
    getAllBuilder.order.mockResolvedValueOnce(supabaseError("getAll failed"));

    const bySectionBuilder = createBuilder();
    bySectionBuilder.order.mockResolvedValueOnce(
      supabaseError("bySection failed"),
    );

    const byKeysBuilder = createBuilder();
    byKeysBuilder.eq.mockResolvedValueOnce(supabaseError("byKeys failed"));

    clientMock.from
      .mockImplementationOnce(() => getAllBuilder)
      .mockImplementationOnce(() => bySectionBuilder)
      .mockImplementationOnce(() => byKeysBuilder);

    await expect(contentService.getAllContents()).rejects.toMatchObject({
      message: "getAll failed",
    });
    await expect(
      contentService.getContentsBySection("home"),
    ).rejects.toMatchObject({
      message: "bySection failed",
    });
    await expect(
      contentService.getContentsByKeys(["home_hero"]),
    ).rejects.toMatchObject({
      message: "byKeys failed",
    });
  });

  it("creates content, uploads file and returns content with public URL", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1710000000000);

    const insertBuilder = createBuilder();
    insertBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        content_id: "c-2",
        content_key: "home_hero",
        bucket_path:
          "sites-content/home/home_hero/1710000000000-banner_hero.png",
      }),
    );

    clientMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
    });
    clientMock.from.mockReturnValueOnce(insertBuilder);
    (storageService.uploadFile as jest.Mock).mockResolvedValueOnce(undefined);

    const file = new File(["img"], "banner hero.png", { type: "image/png" });

    const result = await contentService.createContent({
      content_key: "home_hero",
      title: "Hero",
      description: "Hero section",
      category: "homepage",
      content_type: "image",
      page_section: "home",
      file,
    });

    expect(storageService.uploadFile).toHaveBeenCalledTimes(1);
    expect(result.content_id).toBe("c-2");
    expect(result.public_url).toContain("atenas-gallery");

    (Date.now as jest.Mock).mockRestore();
  });

  it("rolls back uploaded file when create insert fails", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1710000000001);

    const insertBuilder = createBuilder();
    insertBuilder.single.mockResolvedValueOnce(supabaseError("insert failed"));

    clientMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
    });
    clientMock.from.mockReturnValueOnce(insertBuilder);
    (storageService.uploadFile as jest.Mock).mockResolvedValueOnce(undefined);
    (storageService.deleteFile as jest.Mock).mockResolvedValueOnce(undefined);

    const file = new File(["img"], "banner.png", { type: "image/png" });

    await expect(
      contentService.createContent({
        content_key: "home_banner",
        title: "Banner",
        description: "Banner section",
        category: "homepage",
        content_type: "image",
        page_section: "home",
        file,
      }),
    ).rejects.toMatchObject({ message: "insert failed" });

    expect(storageService.deleteFile).toHaveBeenCalledTimes(1);

    (Date.now as jest.Mock).mockRestore();
  });

  it("throws when creating content without authenticated user", async () => {
    clientMock.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    const file = new File(["img"], "banner.png", { type: "image/png" });

    await expect(
      contentService.createContent({
        content_key: "home_banner",
        title: "Banner",
        description: "Banner section",
        category: "homepage",
        content_type: "image",
        page_section: "home",
        file,
      }),
    ).rejects.toThrow("Usuario no autenticado");
  });

  it("toggles content active state via updateContent", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(
      supabaseOk({
        content_id: "c-3",
        content_key: "about_banner",
        bucket_path: "sites-content/about/about_banner/a.png",
        is_active: false,
      }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await contentService.toggleActive("c-3", false);

    expect(result.content_id).toBe("c-3");
    expect(builder.update).toHaveBeenCalledWith({ is_active: false });
  });

  it("updates content metadata", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(
      supabaseOk({
        content_id: "c-4",
        content_key: "home_banner",
        bucket_path: "sites-content/home/home_banner/z.png",
        title: "Nuevo titulo",
      }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await contentService.updateContent("c-4", {
      title: "Nuevo titulo",
    });

    expect(result.content_id).toBe("c-4");
    expect(builder.eq).toHaveBeenCalledWith("content_id", "c-4");
  });

  it("throws when updateContent fails", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(supabaseError("update failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      contentService.updateContent("c-4", { title: "Otro" }),
    ).rejects.toMatchObject({ message: "update failed" });
  });

  it("replaces content file and deletes previous file", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1710000001000);

    const fetchBuilder = createBuilder();
    fetchBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        content_key: "home_hero",
        page_section: "home",
        bucket_path: "sites-content/home/home_hero/old.png",
      }),
    );

    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        content_id: "c-5",
        content_key: "home_hero",
        bucket_path: "sites-content/home/home_hero/1710000001000-new_file.png",
      }),
    );

    clientMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-2" } },
    });
    clientMock.from
      .mockImplementationOnce(() => fetchBuilder)
      .mockImplementationOnce(() => updateBuilder);
    (storageService.uploadFile as jest.Mock).mockResolvedValueOnce(undefined);
    (storageService.deleteFile as jest.Mock).mockResolvedValue(undefined);

    const result = await contentService.updateContentFile(
      "home_hero",
      new File(["x"], "new file.png", { type: "image/png" }),
    );

    expect(result.content_id).toBe("c-5");
    expect(storageService.uploadFile).toHaveBeenCalledTimes(1);
    expect(storageService.deleteFile).toHaveBeenCalledWith("atenas-gallery", [
      "sites-content/home/home_hero/old.png",
    ]);

    (Date.now as jest.Mock).mockRestore();
  });

  it("rolls back new file when updateContentFile db update fails", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1710000001001);

    const fetchBuilder = createBuilder();
    fetchBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        content_key: "home_hero",
        page_section: "home",
        bucket_path: "sites-content/home/home_hero/old.png",
      }),
    );

    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseError("update file failed"),
    );

    clientMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-2" } },
    });
    clientMock.from
      .mockImplementationOnce(() => fetchBuilder)
      .mockImplementationOnce(() => updateBuilder);
    (storageService.uploadFile as jest.Mock).mockResolvedValueOnce(undefined);
    (storageService.deleteFile as jest.Mock).mockResolvedValue(undefined);

    await expect(
      contentService.updateContentFile(
        "home_hero",
        new File(["x"], "new file.png", { type: "image/png" }),
      ),
    ).rejects.toMatchObject({ message: "update file failed" });

    expect(storageService.deleteFile).toHaveBeenCalledTimes(1);

    (Date.now as jest.Mock).mockRestore();
  });

  it("throws when updateContentFile cannot load current content", async () => {
    const fetchBuilder = createBuilder();
    fetchBuilder.single.mockResolvedValueOnce(
      supabaseError("fetch current failed"),
    );

    clientMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-2" } },
    });
    clientMock.from.mockReturnValueOnce(fetchBuilder);

    await expect(
      contentService.updateContentFile(
        "home_hero",
        new File(["x"], "new file.png", { type: "image/png" }),
      ),
    ).rejects.toMatchObject({ message: "fetch current failed" });
  });

  it("throws when updating file without authenticated user", async () => {
    clientMock.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
    });

    await expect(
      contentService.updateContentFile(
        "home_hero",
        new File(["x"], "new.png", { type: "image/png" }),
      ),
    ).rejects.toThrow("Usuario no autenticado");
  });

  it("deletes content file and record", async () => {
    const fetchBuilder = createBuilder();
    fetchBuilder.single.mockResolvedValueOnce(
      supabaseOk({ bucket_path: "sites-content/home/home_hero/old.png" }),
    );

    const deleteBuilder = createBuilder();
    deleteBuilder.eq.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => fetchBuilder)
      .mockImplementationOnce(() => deleteBuilder);
    (storageService.deleteFile as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(
      contentService.deleteContent("c-del-1"),
    ).resolves.toBeUndefined();

    expect(storageService.deleteFile).toHaveBeenCalledWith("atenas-gallery", [
      "sites-content/home/home_hero/old.png",
    ]);
  });

  it("throws when delete content cannot fetch current record", async () => {
    const fetchBuilder = createBuilder();
    fetchBuilder.single.mockResolvedValueOnce(
      supabaseError("fetch delete failed"),
    );

    clientMock.from.mockReturnValueOnce(fetchBuilder);

    await expect(contentService.deleteContent("c-del-2")).rejects.toMatchObject(
      {
        message: "fetch delete failed",
      },
    );
  });

  it("throws when delete content fails at db delete", async () => {
    const fetchBuilder = createBuilder();
    fetchBuilder.single.mockResolvedValueOnce(
      supabaseOk({ bucket_path: "sites-content/home/home_hero/old.png" }),
    );

    const deleteBuilder = createBuilder();
    deleteBuilder.eq.mockResolvedValueOnce(supabaseError("delete row failed"));

    clientMock.from
      .mockImplementationOnce(() => fetchBuilder)
      .mockImplementationOnce(() => deleteBuilder);
    (storageService.deleteFile as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(contentService.deleteContent("c-del-3")).rejects.toMatchObject(
      {
        message: "delete row failed",
      },
    );
  });

  it("reorders contents using one update per item", async () => {
    const firstBuilder = createBuilder();
    const secondBuilder = createBuilder();

    firstBuilder.eq.mockResolvedValueOnce({ data: null, error: null });
    secondBuilder.eq.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => firstBuilder)
      .mockImplementationOnce(() => secondBuilder);

    await contentService.reorderContents([
      { id: "c-1", order: 2 },
      { id: "c-2", order: 1 },
    ]);

    expect(firstBuilder.update).toHaveBeenCalledWith({ display_order: 2 });
    expect(secondBuilder.update).toHaveBeenCalledWith({ display_order: 1 });
  });

  it("calculates content stats", async () => {
    const builder = createBuilder();
    builder.select.mockResolvedValueOnce(
      supabaseOk([
        { content_type: "image", is_active: true, page_section: "home" },
        { content_type: "video", is_active: false, page_section: "home" },
        { content_type: "image", is_active: true, page_section: "about" },
      ]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const stats = await contentService.getStats();

    expect(stats.total).toBe(3);
    expect(stats.active).toBe(2);
    expect(stats.photos).toBe(2);
    expect(stats.videos).toBe(1);
    expect(stats.by_section.home).toBe(2);
    expect(stats.by_section.about).toBe(1);
  });

  it("throws when stats query fails", async () => {
    const builder = createBuilder();
    builder.select.mockResolvedValueOnce(supabaseError("stats failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(contentService.getStats()).rejects.toMatchObject({
      message: "stats failed",
    });
  });
});
