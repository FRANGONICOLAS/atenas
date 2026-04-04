import { beneficiaryService } from "@/api/services/beneficiary.service";
import { supabaseOk } from "@/test/mocks/supabase.mock";

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
  in: jest.Mock;
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
    in: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("beneficiaryService integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("integrates update with evaluation linking flow", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        beneficiary_id: "b-2",
        headquarters_id: "hq-1",
        first_name: "Sara",
        last_name: "Rojas",
        birth_date: "2011-02-02",
        category: "Categoría 3",
        phone: "777",
        registry_date: "2026-01-02",
        status: "activo",
        gender: null,
        performance: 75,
        guardian: null,
        address: null,
        emergency_contact: null,
        medical_info: null,
        photo_url: null,
        observation: null,
        created_at: "2026-01-02",
      }),
    );

    const evaluationBuilder = createBuilder();
    evaluationBuilder.single.mockResolvedValueOnce(
      supabaseOk({
        id: "e-22",
        created_at: "2026-02-03",
        anthropometric_detail: { peso: 39 },
        technical_tactic_detail: { pase: 6 },
        emotional_detail: { apoyo_social: "moderado" },
      }),
    );

    const linkBuilder = createBuilder();
    linkBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => updateBuilder)
      .mockImplementationOnce(() => evaluationBuilder)
      .mockImplementationOnce(() => linkBuilder);

    const updated = await beneficiaryService.update("b-2", {
      first_name: "Sara",
      anthropometric_detail: { peso: 39 },
      technical_tactic_detail: { pase: 6 },
      emotional_detail: { apoyo_social: "moderado" },
    });

    expect(updated.beneficiary_id).toBe("b-2");
    expect(updated.latest_evaluation?.id).toBe("e-22");
  });

  it("integrates getByHeadquarterAndCategory with latest evaluation mapping", async () => {
    const listBuilder = createBuilder();
    listBuilder.eq.mockReturnValue(listBuilder);
    listBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-3",
          headquarters_id: "hq-9",
          first_name: "Mateo",
          last_name: "Perez",
          birth_date: "2012-03-03",
          category: "Categoría 1",
          phone: "444",
          registry_date: "2026-01-03",
          status: "activo",
          gender: null,
          performance: 82,
          guardian: null,
          address: null,
          emergency_contact: null,
          medical_info: null,
          photo_url: null,
          observation: null,
          created_at: "2026-01-03",
        },
      ]),
    );

    const evalLookupBuilder = createBuilder();
    evalLookupBuilder.in.mockResolvedValueOnce(
      supabaseOk([
        {
          beneficiary_id: "b-3",
          evaluation: {
            id: "e-3",
            created_at: "2026-01-20",
            anthropometric_detail: { peso: 42 },
            technical_tactic_detail: null,
            emotional_detail: null,
          },
        },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => listBuilder)
      .mockImplementationOnce(() => evalLookupBuilder);

    const result = await beneficiaryService.getByHeadquarterAndCategory(
      "hq-9",
      "Categoría 1",
    );

    expect(result).toHaveLength(1);
    expect(result[0].beneficiary_id).toBe("b-3");
    expect(result[0].latest_evaluation?.id).toBe("e-3");
  });
});
