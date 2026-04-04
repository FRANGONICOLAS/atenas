import { beneficiaryService } from "@/api/services/beneficiary.service";
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
    getPublicUrl: jest.fn(() => "https://cdn.test/photo.jpg"),
  },
}));

type QueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  or: jest.Mock;
  lt: jest.Mock;
  order: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
};

function createBuilder(): QueryBuilder {
  const builder = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    or: jest.fn(),
    lt: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);
  builder.lt.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("beneficiaryService unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns beneficiaries with latest evaluation in getAll", async () => {
    const listBuilder = createBuilder();
    listBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-1",
          headquarters_id: "hq-1",
          first_name: "Ana",
          last_name: "Lopez",
          birth_date: "2012-01-01",
          category: "Categoría 1",
          phone: "123",
          registry_date: "2026-01-01",
          status: "activo",
          gender: "mujer",
          performance: 80,
          guardian: "Padre",
          address: null,
          emergency_contact: null,
          medical_info: null,
          photo_url: null,
          observation: null,
          created_at: "2026-01-01",
        },
      ]),
    );

    const evalLookupBuilder = createBuilder();
    evalLookupBuilder.in.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-1",
          evaluation: {
            id: "e-1",
            created_at: "2026-02-01",
            anthropometric_detail: { peso: 35 },
            technical_tactic_detail: { pase: 7 },
            emotional_detail: { apoyo_social: "si" },
          },
        },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => listBuilder)
      .mockImplementationOnce(() => evalLookupBuilder);

    const result = await beneficiaryService.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].beneficiary_id).toBe("b-1");
    expect(result[0].latest_evaluation?.id).toBe("e-1");
    expect(result[0].anthropometric_detail).toEqual({ peso: 35 });
  });

  it("creates beneficiary with evaluation when payload includes details", async () => {
    const beneficiaryInsertBuilder = createBuilder();
    beneficiaryInsertBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-10",
        headquarters_id: "hq-1",
        first_name: "Luis",
        last_name: "Diaz",
        birth_date: "2010-10-10",
        category: "Categoría 2",
        phone: "555",
        registry_date: "2026-01-10",
        status: "activo",
        gender: null,
        performance: null,
        guardian: null,
        address: null,
        emergency_contact: null,
        medical_info: null,
        photo_url: null,
        observation: null,
        created_at: "2026-01-10",
      }),
    );

    const evaluationBuilder = createBuilder();
    evaluationBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-10",
        created_at: "2026-01-11",
        anthropometric_detail: { peso: 40 },
        technical_tactic_detail: { pase: 8 },
        emotional_detail: { apoyo_social: "si" },
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => beneficiaryInsertBuilder)
      .mockImplementationOnce(() => evaluationBuilder)
      .mockImplementationOnce(() => linkBuilder);

    const created = await beneficiaryService.create({
      headquarters_id: "hq-1",
      first_name: "Luis",
      last_name: "Diaz",
      birth_date: "2010-10-10",
      category: "Categoría 2",
      phone: "555",
      anthropometric_detail: { peso: 40 },
      technical_tactic_detail: { pase: 8 },
      emotional_detail: { apoyo_social: "si" },
    });

    expect(created.beneficiary_id).toBe("b-10");
    expect(created.latest_evaluation?.id).toBe("e-10");
  });

  it("throws when create fails", async () => {
    const beneficiaryInsertBuilder = createBuilder();
    beneficiaryInsertBuilder.single.mockResolvedValueOnce(
      supabaseError("Insert failed"),
    );

    clientMock.from.mockReturnValueOnce(beneficiaryInsertBuilder);

    await expect(
      beneficiaryService.create({
        headquarters_id: "hq-1",
        first_name: "Luis",
        last_name: "Diaz",
        birth_date: "2010-10-10",
        category: "Categoría 2",
        phone: "555",
      }),
    ).rejects.toMatchObject({ message: "Insert failed" });
  });

  it("counts evaluations by beneficiary", async () => {
    const countBuilder = createBuilder();
    countBuilder.eq.mockResolvedValueOnce({ count: 3, error: null });

    clientMock.from.mockReturnValueOnce(countBuilder);

    const count = await beneficiaryService.countEvaluations("b-1");

    expect(count).toBe(3);
  });

  it("returns null when getById does not find beneficiary", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    const result = await beneficiaryService.getById("missing");

    expect(result).toBeNull();
  });

  it("returns mapped beneficiary when getById succeeds", async () => {
    const beneficiaryBuilder = createBuilder();
    beneficiaryBuilder.maybeSingle.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-20",
        headquarters_id: "hq-1",
        first_name: "Nora",
        last_name: "Mora",
        birth_date: "2012-01-01",
        category: "Categoría 1",
        phone: "123",
        registry_date: "2026-01-01",
        status: "activo",
        gender: null,
        performance: 70,
        guardian: null,
        address: null,
        emergency_contact: null,
        medical_info: null,
        photo_url: null,
        observation: null,
        created_at: "2026-01-01",
      }),
    );

    const evalBuilder = createBuilder();
    evalBuilder.in.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from
      .mockImplementationOnce(() => beneficiaryBuilder)
      .mockImplementationOnce(() => evalBuilder);

    const result = await beneficiaryService.getById("b-20");

    expect(result?.beneficiary_id).toBe("b-20");
  });

  it("creates beneficiary without evaluation payload", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-21",
        headquarters_id: "hq-1",
        first_name: "Lina",
        last_name: "Diaz",
        birth_date: "2013-01-01",
        category: "Categoría 2",
        phone: "999",
        registry_date: "2026-01-01",
        status: "activo",
        gender: null,
        performance: null,
        guardian: null,
        address: null,
        emergency_contact: null,
        medical_info: null,
        photo_url: null,
        observation: null,
        created_at: "2026-01-01",
      }),
    );

    clientMock.from.mockReturnValueOnce(createBuilderLocal);

    const created = await beneficiaryService.create({
      headquarters_id: "hq-1",
      first_name: "Lina",
      last_name: "Diaz",
      birth_date: "2013-01-01",
      category: "Categoría 2",
      phone: "999",
    });

    expect(created.beneficiary_id).toBe("b-21");
    expect(created.latest_evaluation).toBeUndefined();
  });

  it("updates beneficiary without creating evaluation", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-30",
        headquarters_id: "hq-1",
        first_name: "Edit",
        last_name: "User",
        birth_date: "2012-01-01",
        category: "Categoría 1",
        phone: "123",
        registry_date: "2026-01-01",
        status: "activo",
        gender: null,
        performance: 88,
        guardian: null,
        address: null,
        emergency_contact: null,
        medical_info: null,
        photo_url: null,
        observation: null,
        created_at: "2026-01-01",
      }),
    );

    clientMock.from.mockReturnValueOnce(updateBuilder);

    const updated = await beneficiaryService.update("b-30", {
      first_name: "Edit",
      performance: 88,
    });

    expect(updated.beneficiary_id).toBe("b-30");
    expect(updated.latest_evaluation).toBeUndefined();
  });

  it("gets beneficiaries by filters", async () => {
    const byHeadquarter = createBuilder();
    byHeadquarter.order.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-40",
          headquarters_id: "hq-1",
          first_name: "Ana",
          last_name: "H",
          birth_date: "2012-01-01",
          category: "Categoría 1",
          phone: "1",
          registry_date: "2026-01-01",
          status: "activo",
          gender: null,
          performance: 80,
          guardian: null,
          address: null,
          emergency_contact: null,
          medical_info: null,
          photo_url: null,
          observation: null,
          created_at: "2026-01-01",
        },
      ]),
    );

    const evalHeadquarter = createBuilder();
    evalHeadquarter.in.mockResolvedValueOnce(supabaseOk([]));

    const byCategory = createBuilder();
    byCategory.order.mockResolvedValueOnce(supabaseOk([]));

    const byStatus = createBuilder();
    byStatus.order.mockResolvedValueOnce(supabaseOk([]));

    const lowPerformance = createBuilder();
    lowPerformance.order.mockResolvedValueOnce(supabaseOk([]));

    const search = createBuilder();
    search.order.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from
      .mockImplementationOnce(() => byHeadquarter)
      .mockImplementationOnce(() => evalHeadquarter)
      .mockImplementationOnce(() => byCategory)
      .mockImplementationOnce(() => byStatus)
      .mockImplementationOnce(() => lowPerformance)
      .mockImplementationOnce(() => search);

    const headquarterResult =
      await beneficiaryService.getByHeadquarterId("hq-1");
    const categoryResult =
      await beneficiaryService.getByCategory("Categoría 1");
    const statusResult = await beneficiaryService.getByStatus("activo");
    const lowResult = await beneficiaryService.getLowPerformance(60);
    const searchResult = await beneficiaryService.searchByName("ana");

    expect(headquarterResult).toHaveLength(1);
    expect(categoryResult).toEqual([]);
    expect(statusResult).toEqual([]);
    expect(lowResult).toEqual([]);
    expect(searchResult).toEqual([]);
  });

  it("deletes beneficiary", async () => {
    const deleteBuilder = createBuilder();
    deleteBuilder.eq.mockResolvedValueOnce({ error: null });

    clientMock.from.mockReturnValueOnce(deleteBuilder);

    await expect(beneficiaryService.delete("b-1")).resolves.toBeUndefined();
  });

  it("counts totals by headquarter and category", async () => {
    const totalBuilder = createBuilder();
    totalBuilder.select.mockImplementationOnce(async () => ({
      count: 12,
      error: null,
    }));

    const byHeadquarterBuilder = createBuilder();
    byHeadquarterBuilder.eq.mockResolvedValueOnce({ count: 4, error: null });

    const byCategoryBuilder = createBuilder();
    byCategoryBuilder.eq.mockResolvedValueOnce({ count: 6, error: null });

    clientMock.from
      .mockImplementationOnce(() => totalBuilder)
      .mockImplementationOnce(() => byHeadquarterBuilder)
      .mockImplementationOnce(() => byCategoryBuilder);

    const total = await beneficiaryService.count();
    const byHeadquarter = await beneficiaryService.countByHeadquarter("hq-1");
    const byCategory = await beneficiaryService.countByCategory("Categoría 1");

    expect(total).toBe(12);
    expect(byHeadquarter).toBe(4);
    expect(byCategory).toBe(6);
  });

  it("uploads photo and returns public url", async () => {
    const uploadFileMock = storageService.uploadFile as jest.Mock;
    const getPublicUrlMock = storageService.getPublicUrl as jest.Mock;

    uploadFileMock.mockResolvedValueOnce({ path: "beneficiaries/file.png" });
    getPublicUrlMock.mockReturnValueOnce("https://cdn.test/photo.jpg");

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    const url = await beneficiaryService.uploadPhoto("b-1", file);

    expect(uploadFileMock).toHaveBeenCalled();
    expect(getPublicUrlMock).toHaveBeenCalled();
    expect(url).toBe("https://cdn.test/photo.jpg");
  });

  it("returns empty list when latest evaluation relation is null", async () => {
    const listBuilder = createBuilder();
    listBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-null-rel",
          headquarters_id: "hq-1",
          first_name: "No",
          last_name: "Eval",
          birth_date: "2012-01-01",
          category: "Categoría 1",
          phone: "123",
          registry_date: "2026-01-01",
          status: "activo",
          created_at: "2026-01-01",
        },
      ]),
    );

    const evalLookupBuilder = createBuilder();
    evalLookupBuilder.in.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-null-rel",
          evaluation: null,
        },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => listBuilder)
      .mockImplementationOnce(() => evalLookupBuilder);

    const result = await beneficiaryService.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].latest_evaluation).toBeUndefined();
  });

  it("keeps newest evaluation when multiple evaluations exist", async () => {
    const listBuilder = createBuilder();
    listBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-latest",
          headquarters_id: "hq-1",
          first_name: "Latest",
          last_name: "Eval",
          birth_date: "2012-01-01",
          category: "Categoría 1",
          phone: "123",
          registry_date: "2026-01-01",
          status: "activo",
          created_at: "2026-01-01",
        },
      ]),
    );

    const evalLookupBuilder = createBuilder();
    evalLookupBuilder.in.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-latest",
          evaluation: {
            id: "e-old",
            created_at: "2026-01-01",
            anthropometric_detail: { peso: 30 },
            technical_tactic_detail: null,
            emotional_detail: null,
          },
        },
        {
          beneficiary_id: "b-latest",
          evaluation: {
            id: "e-new",
            created_at: "2026-02-01",
            anthropometric_detail: { peso: 32 },
            technical_tactic_detail: null,
            emotional_detail: null,
          },
        },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => listBuilder)
      .mockImplementationOnce(() => evalLookupBuilder);

    const result = await beneficiaryService.getAll();

    expect(result[0].latest_evaluation?.id).toBe("e-new");
    expect(result[0].anthropometric_detail).toEqual({ peso: 32 });
  });

  it("throws when countByHeadquarter fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("Count HQ failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      beneficiaryService.countByHeadquarter("hq-1"),
    ).rejects.toMatchObject({
      message: "Count HQ failed",
    });
  });

  it("returns zero when count result is null", async () => {
    const totalBuilder = createBuilder();
    totalBuilder.select.mockImplementationOnce(async () => ({
      count: null,
      error: null,
    }));

    clientMock.from.mockReturnValueOnce(totalBuilder);

    const total = await beneficiaryService.count();

    expect(total).toBe(0);
  });

  it("throws when getByHeadquarterAndCategory fails", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(supabaseError("Filter failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      beneficiaryService.getByHeadquarterAndCategory("hq-1", "Categoría 1"),
    ).rejects.toMatchObject({
      message: "Filter failed",
    });
  });

  it("throws on read query failures", async () => {
    const getAllBuilder = createBuilder();
    getAllBuilder.order.mockResolvedValueOnce(supabaseError("GetAll failed"));

    const getByIdBuilder = createBuilder();
    getByIdBuilder.maybeSingle.mockResolvedValueOnce(
      supabaseError("GetById failed"),
    );

    const byHqBuilder = createBuilder();
    byHqBuilder.order.mockResolvedValueOnce(supabaseError("ByHQ failed"));

    const byCategoryBuilder = createBuilder();
    byCategoryBuilder.order.mockResolvedValueOnce(
      supabaseError("ByCategory failed"),
    );

    const byStatusBuilder = createBuilder();
    byStatusBuilder.order.mockResolvedValueOnce(
      supabaseError("ByStatus failed"),
    );

    const lowPerformanceBuilder = createBuilder();
    lowPerformanceBuilder.order.mockResolvedValueOnce(
      supabaseError("LowPerformance failed"),
    );

    const searchBuilder = createBuilder();
    searchBuilder.order.mockResolvedValueOnce(supabaseError("Search failed"));

    clientMock.from
      .mockImplementationOnce(() => getAllBuilder)
      .mockImplementationOnce(() => getByIdBuilder)
      .mockImplementationOnce(() => byHqBuilder)
      .mockImplementationOnce(() => byCategoryBuilder)
      .mockImplementationOnce(() => byStatusBuilder)
      .mockImplementationOnce(() => lowPerformanceBuilder)
      .mockImplementationOnce(() => searchBuilder);

    await expect(beneficiaryService.getAll()).rejects.toMatchObject({
      message: "GetAll failed",
    });
    await expect(beneficiaryService.getById("b-1")).rejects.toMatchObject({
      message: "GetById failed",
    });
    await expect(
      beneficiaryService.getByHeadquarterId("hq-1"),
    ).rejects.toMatchObject({
      message: "ByHQ failed",
    });
    await expect(
      beneficiaryService.getByCategory("Categoría 1"),
    ).rejects.toMatchObject({
      message: "ByCategory failed",
    });
    await expect(
      beneficiaryService.getByStatus("activo"),
    ).rejects.toMatchObject({
      message: "ByStatus failed",
    });
    await expect(
      beneficiaryService.getLowPerformance(60),
    ).rejects.toMatchObject({
      message: "LowPerformance failed",
    });
    await expect(beneficiaryService.searchByName("ana")).rejects.toMatchObject({
      message: "Search failed",
    });
  });

  it("throws when create evaluation insertion fails", async () => {
    const beneficiaryInsertBuilder = createBuilder();
    beneficiaryInsertBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-err-eval",
        headquarters_id: "hq-1",
        first_name: "Eval",
        last_name: "Fail",
        birth_date: "2010-10-10",
        category: "Categoría 2",
        phone: "555",
        registry_date: "2026-01-10",
        status: "activo",
        created_at: "2026-01-10",
      }),
    );

    const evaluationBuilder = createBuilder();
    evaluationBuilder.single.mockResolvedValueOnce(
      supabaseError("Evaluation insert failed"),
    );

    clientMock.from
      .mockImplementationOnce(() => beneficiaryInsertBuilder)
      .mockImplementationOnce(() => evaluationBuilder);

    await expect(
      beneficiaryService.create({
        headquarters_id: "hq-1",
        first_name: "Eval",
        last_name: "Fail",
        birth_date: "2010-10-10",
        category: "Categoría 2",
        phone: "555",
        anthropometric_detail: { peso: 40 },
      }),
    ).rejects.toMatchObject({
      message: "Evaluation insert failed",
    });
  });

  it("throws when beneficiary-evaluation relation insert fails", async () => {
    const beneficiaryInsertBuilder = createBuilder();
    beneficiaryInsertBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-err-link",
        headquarters_id: "hq-1",
        first_name: "Link",
        last_name: "Fail",
        birth_date: "2010-10-10",
        category: "Categoría 2",
        phone: "555",
        registry_date: "2026-01-10",
        status: "activo",
        created_at: "2026-01-10",
      }),
    );

    const evaluationBuilder = createBuilder();
    evaluationBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-link-fail",
        created_at: "2026-01-11",
        anthropometric_detail: { peso: 40 },
        technical_tactic_detail: null,
        emotional_detail: null,
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce(supabaseError("Link failed"));

    clientMock.from
      .mockImplementationOnce(() => beneficiaryInsertBuilder)
      .mockImplementationOnce(() => evaluationBuilder)
      .mockImplementationOnce(() => linkBuilder);

    await expect(
      beneficiaryService.create({
        headquarters_id: "hq-1",
        first_name: "Link",
        last_name: "Fail",
        birth_date: "2010-10-10",
        category: "Categoría 2",
        phone: "555",
        anthropometric_detail: { peso: 40 },
      }),
    ).rejects.toMatchObject({
      message: "Link failed",
    });
  });

  it("maps undefined details when evaluation fields are null", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-null-details",
        headquarters_id: "hq-1",
        first_name: "Null",
        last_name: "Details",
        birth_date: "2013-01-01",
        category: "Categoría 2",
        phone: "999",
        registry_date: "2026-01-01",
        status: "activo",
        created_at: "2026-01-01",
      }),
    );

    const evaluationBuilder = createBuilder();
    evaluationBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-null-details",
        created_at: "2026-01-11",
        anthropometric_detail: { peso: 32 },
        technical_tactic_detail: null,
        emotional_detail: null,
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => createBuilderLocal)
      .mockImplementationOnce(() => evaluationBuilder)
      .mockImplementationOnce(() => linkBuilder);

    const created = await beneficiaryService.create({
      headquarters_id: "hq-1",
      first_name: "Null",
      last_name: "Details",
      birth_date: "2013-01-01",
      category: "Categoría 2",
      phone: "999",
      anthropometric_detail: { peso: 32 },
    });

    expect(created.technical_tactic_detail).toBeUndefined();
    expect(created.emotional_detail).toBeUndefined();
  });

  it("throws when delete, countEvaluations, count and countByCategory fail", async () => {
    const deleteBuilder = createBuilder();
    deleteBuilder.eq.mockResolvedValueOnce(supabaseError("Delete failed"));

    const countEvalBuilder = createBuilder();
    countEvalBuilder.eq.mockResolvedValueOnce(
      supabaseError("Count evaluations failed"),
    );

    const countBuilder = createBuilder();
    countBuilder.select.mockImplementationOnce(async () =>
      supabaseError("Count failed"),
    );

    const countCategoryBuilder = createBuilder();
    countCategoryBuilder.eq.mockResolvedValueOnce(
      supabaseError("Count category failed"),
    );

    clientMock.from
      .mockImplementationOnce(() => deleteBuilder)
      .mockImplementationOnce(() => countEvalBuilder)
      .mockImplementationOnce(() => countBuilder)
      .mockImplementationOnce(() => countCategoryBuilder);

    await expect(beneficiaryService.delete("b-1")).rejects.toMatchObject({
      message: "Delete failed",
    });
    await expect(
      beneficiaryService.countEvaluations("b-1"),
    ).rejects.toMatchObject({
      message: "Count evaluations failed",
    });
    await expect(beneficiaryService.count()).rejects.toMatchObject({
      message: "Count failed",
    });
    await expect(
      beneficiaryService.countByCategory("Categoría 1"),
    ).rejects.toMatchObject({
      message: "Count category failed",
    });
  });

  it("returns empty arrays when query data is null", async () => {
    const getAllBuilder = createBuilder();
    getAllBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const byHqBuilder = createBuilder();
    byHqBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const byCategoryBuilder = createBuilder();
    byCategoryBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const byHqCategoryBuilder = createBuilder();
    byHqCategoryBuilder.order.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const searchBuilder = createBuilder();
    searchBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const byStatusBuilder = createBuilder();
    byStatusBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const lowPerformanceBuilder = createBuilder();
    lowPerformanceBuilder.order.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    clientMock.from
      .mockImplementationOnce(() => getAllBuilder)
      .mockImplementationOnce(() => byHqBuilder)
      .mockImplementationOnce(() => byCategoryBuilder)
      .mockImplementationOnce(() => byHqCategoryBuilder)
      .mockImplementationOnce(() => searchBuilder)
      .mockImplementationOnce(() => byStatusBuilder)
      .mockImplementationOnce(() => lowPerformanceBuilder);

    await expect(beneficiaryService.getAll()).resolves.toEqual([]);
    await expect(
      beneficiaryService.getByHeadquarterId("hq-1"),
    ).resolves.toEqual([]);
    await expect(
      beneficiaryService.getByCategory("Categoría 1"),
    ).resolves.toEqual([]);
    await expect(
      beneficiaryService.getByHeadquarterAndCategory("hq-1", "Categoría 1"),
    ).resolves.toEqual([]);
    await expect(beneficiaryService.searchByName("ana")).resolves.toEqual([]);
    await expect(beneficiaryService.getByStatus("activo")).resolves.toEqual([]);
    await expect(beneficiaryService.getLowPerformance(60)).resolves.toEqual([]);
  });

  it("returns zero when count-based queries return null", async () => {
    const countEvalBuilder = createBuilder();
    countEvalBuilder.eq.mockResolvedValueOnce({ count: null, error: null });

    const countByHqBuilder = createBuilder();
    countByHqBuilder.eq.mockResolvedValueOnce({ count: null, error: null });

    const countByCategoryBuilder = createBuilder();
    countByCategoryBuilder.eq.mockResolvedValueOnce({
      count: null,
      error: null,
    });

    clientMock.from
      .mockImplementationOnce(() => countEvalBuilder)
      .mockImplementationOnce(() => countByHqBuilder)
      .mockImplementationOnce(() => countByCategoryBuilder);

    await expect(beneficiaryService.countEvaluations("b-1")).resolves.toBe(0);
    await expect(beneficiaryService.countByHeadquarter("hq-1")).resolves.toBe(
      0,
    );
    await expect(
      beneficiaryService.countByCategory("Categoría 1"),
    ).resolves.toBe(0);
  });

  it("throws when update query fails", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(supabaseError("Update failed"));

    clientMock.from.mockReturnValueOnce(updateBuilder);

    await expect(
      beneficiaryService.update("b-30", { first_name: "Edit" }),
    ).rejects.toMatchObject({
      message: "Update failed",
    });
  });

  it("maps undefined details in update when latest evaluation fields are null", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-update-null-details",
        headquarters_id: "hq-1",
        first_name: "Edit",
        last_name: "Null",
        birth_date: "2012-01-01",
        category: "Categoría 1",
        phone: "123",
        registry_date: "2026-01-01",
        status: "activo",
        created_at: "2026-01-01",
      }),
    );

    const evaluationBuilder = createBuilder();
    evaluationBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-update-null-details",
        created_at: "2026-01-11",
        anthropometric_detail: null,
        technical_tactic_detail: null,
        emotional_detail: null,
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => updateBuilder)
      .mockImplementationOnce(() => evaluationBuilder)
      .mockImplementationOnce(() => linkBuilder);

    const updated = await beneficiaryService.update("b-update-null-details", {
      first_name: "Edit",
      anthropometric_detail: { peso: 33 },
    });

    expect(updated.anthropometric_detail).toBeUndefined();
    expect(updated.technical_tactic_detail).toBeUndefined();
    expect(updated.emotional_detail).toBeUndefined();
  });

  it("maps row fallbacks when nullable fields are missing", async () => {
    const listBuilder = createBuilder();
    listBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-fallbacks",
          headquarters_id: "hq-1",
          first_name: "Fallback",
          last_name: "Row",
          birth_date: null,
          category: null,
          phone: null,
          registry_date: null,
          status: null,
          gender: null,
          performance: null,
          guardian: null,
          address: null,
          emergency_contact: null,
          medical_info: null,
          photo_url: null,
          observation: null,
          created_at: null,
        },
      ]),
    );

    const evalBuilder = createBuilder();
    evalBuilder.in.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from
      .mockImplementationOnce(() => listBuilder)
      .mockImplementationOnce(() => evalBuilder);

    const result = await beneficiaryService.getAll();

    expect(result[0]).toMatchObject({
      birth_date: "",
      category: "",
      phone: "",
      registry_date: "",
      status: undefined,
      created_at: undefined,
      photo_url: null,
    });
  });
});
