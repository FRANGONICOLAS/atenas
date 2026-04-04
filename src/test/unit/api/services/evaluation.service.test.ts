import { evaluationService } from "@/api/services/evaluation.service";
import { supabaseError, supabaseOk } from "@/test/mocks/supabase.mock";

jest.mock("@/api/supabase/client", () => ({
  client: {
    from: jest.fn(),
  },
}));

type QueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  single: jest.Mock;
};

function createBuilder(): QueryBuilder {
  const builder = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("evaluationService unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("gets evaluation by id", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-1",
        created_at: "2026-01-01",
        type: "anthropometric",
        questions_answers: { peso: 40 },
      }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await evaluationService.getById("e-1");

    expect(result.id).toBe("e-1");
    expect(builder.eq).toHaveBeenCalledWith("id", "e-1");
  });

  it("throws when getById fails", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(supabaseError("Not found"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(evaluationService.getById("missing")).rejects.toMatchObject({
      message: "Not found",
    });
  });

  it("gets detail by evaluation id", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-1",
        evaluation: {
          id: "e-2",
          created_at: "2026-01-02",
          type: "technical_tactic",
          questions_answers: { pase: 4 },
        },
        beneficiary: {
          first_name: "Ana",
          last_name: "Lopez",
        },
      }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await evaluationService.getDetail("e-2");

    expect(result.beneficiary_id).toBe("b-1");
  });

  it("throws when getDetail fails", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(supabaseError("Detail failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(evaluationService.getDetail("e-2")).rejects.toMatchObject({
      message: "Detail failed",
    });
  });

  it("creates evaluation for beneficiary and links relation", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-3",
        created_at: "2026-01-03",
        type: "psychological_emotional",
        questions_answers: { observaciones: "ok" },
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => createBuilderLocal)
      .mockImplementationOnce(() => linkBuilder);

    const created = await evaluationService.createForBeneficiary("b-1", {
      type: "psychological_emotional",
      questions_answers: { observaciones: "ok" },
    });

    expect(created.id).toBe("e-3");
    expect(linkBuilder.insert).toHaveBeenCalledWith([
      {
        beneficiary_id: "b-1",
        evaluation_id: "e-3",
      },
    ]);
  });

  it("throws when createForBeneficiary insert returns null data", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    clientMock.from.mockReturnValueOnce(createBuilderLocal);

    await expect(
      evaluationService.createForBeneficiary("b-1", {
        type: "anthropometric",
      }),
    ).rejects.toMatchObject({
      message: "Failed to create evaluation",
    });
  });

  it("throws when relation link fails in createForBeneficiary", async () => {
    const createBuilderLocal = createBuilder();
    createBuilderLocal.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-4",
        created_at: "2026-01-04",
        type: "anthropometric",
        questions_answers: null,
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce(supabaseError("Link failed"));

    clientMock.from
      .mockImplementationOnce(() => createBuilderLocal)
      .mockImplementationOnce(() => linkBuilder);

    await expect(
      evaluationService.createForBeneficiary("b-1", {
        type: "anthropometric",
      }),
    ).rejects.toMatchObject({
      message: "Link failed",
    });
  });

  it("returns empty array when getByHeadquarterId has null data", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(evaluationService.getByHeadquarterId("hq-1")).resolves.toEqual(
      [],
    );
  });

  it("throws when getByHeadquarterId fails", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(supabaseError("By HQ failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      evaluationService.getByHeadquarterId("hq-1"),
    ).rejects.toMatchObject({
      message: "By HQ failed",
    });
  });

  it("returns rows when getByBeneficiaryId succeeds", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-1",
          evaluation: {
            id: "e-1",
            type: "anthropometric",
          },
        },
      ]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await evaluationService.getByBeneficiaryId("b-1");

    expect(result).toHaveLength(1);
  });

  it("returns empty array when getByBeneficiaryId has null data", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(evaluationService.getByBeneficiaryId("b-1")).resolves.toEqual(
      [],
    );
  });

  it("throws when getByBeneficiaryId fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("By beneficiary failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      evaluationService.getByBeneficiaryId("b-1"),
    ).rejects.toMatchObject({
      message: "By beneficiary failed",
    });
  });

  it("deletes evaluation relation and evaluation", async () => {
    const linkBuilder = createBuilder();
    linkBuilder.eq.mockResolvedValueOnce({ error: null });

    const evalBuilder = createBuilder();
    evalBuilder.eq.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => linkBuilder)
      .mockImplementationOnce(() => evalBuilder);

    await expect(
      evaluationService.deleteEvaluation("e-9"),
    ).resolves.toBeUndefined();
  });

  it("throws when deleteEvaluation relation delete fails", async () => {
    const linkBuilder = createBuilder();
    linkBuilder.eq.mockResolvedValueOnce(supabaseError("Delete link failed"));

    clientMock.from.mockReturnValueOnce(linkBuilder);

    await expect(
      evaluationService.deleteEvaluation("e-9"),
    ).rejects.toMatchObject({
      message: "Delete link failed",
    });
  });

  it("throws when deleteEvaluation main delete fails", async () => {
    const linkBuilder = createBuilder();
    linkBuilder.eq.mockResolvedValueOnce({ error: null });

    const evalBuilder = createBuilder();
    evalBuilder.eq.mockResolvedValueOnce(supabaseError("Delete eval failed"));

    clientMock.from
      .mockImplementationOnce(() => linkBuilder)
      .mockImplementationOnce(() => evalBuilder);

    await expect(
      evaluationService.deleteEvaluation("e-9"),
    ).rejects.toMatchObject({
      message: "Delete eval failed",
    });
  });

  it("updates evaluation", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-10",
        created_at: "2026-01-10",
        type: "technical_tactic",
        questions_answers: { pase: 3 },
      }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await evaluationService.updateEvaluation("e-10", {
      type: "technical_tactic",
      questions_answers: { pase: 3 },
    });

    expect(result.id).toBe("e-10");
  });

  it("throws when updateEvaluation fails", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(supabaseError("Update failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      evaluationService.updateEvaluation("e-10", {
        type: "technical_tactic",
      }),
    ).rejects.toMatchObject({
      message: "Update failed",
    });
  });
});
