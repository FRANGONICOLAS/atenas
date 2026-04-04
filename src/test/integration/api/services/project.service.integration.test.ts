import { projectService } from "@/api/services/project.service";
import { supabaseOk } from "@/test/mocks/supabase.mock";

jest.mock("@/api/supabase/client", () => ({
  client: {
    from: jest.fn(),
  },
}));

type QueryBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  or: jest.Mock;
  order: jest.Mock;
};

function createBuilder(): QueryBuilder {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    or: jest.fn(),
    order: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("projectService integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("integrates getByHeadquarter by resolving relation and projects list", async () => {
    const relationBuilder = createBuilder();
    relationBuilder.eq.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_1" }, { project_id: "p_2" }]),
    );

    const projectsBuilder = createBuilder();
    projectsBuilder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          project_id: "p_1",
          name: "Proyecto Uno",
          finance_goal: 1000,
          start_date: "2026-01-01",
        },
        {
          project_id: "p_2",
          name: "Proyecto Dos",
          finance_goal: 500,
          start_date: "2026-01-02",
        },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => relationBuilder)
      .mockImplementationOnce(() => projectsBuilder);

    const result = await projectService.getByHeadquarter("hq-1");

    expect(result).toHaveLength(2);
    expect(projectsBuilder.in).toHaveBeenCalledWith("project_id", [
      "p_1",
      "p_2",
    ]);
  });

  it("integrates search by term", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(
      supabaseOk([
        {
          project_id: "p_9",
          name: "Proyecto Salud",
        },
      ]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await projectService.search("salud");

    expect(builder.or).toHaveBeenCalledWith(
      "name.ilike.%salud%,description.ilike.%salud%",
    );
    expect(result[0].project_id).toBe("p_9");
  });
});
