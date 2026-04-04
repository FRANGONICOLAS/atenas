import { projectService } from "@/api/services/project.service";
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
  in: jest.Mock;
  or: jest.Mock;
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

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("projectService unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns ordered projects", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_1", name: "Proyecto A" }]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await projectService.getAll();

    expect(clientMock.from).toHaveBeenCalledWith("project");
    expect(builder.order).toHaveBeenCalledWith("start_date", {
      ascending: false,
    });
    expect(result).toHaveLength(1);
  });

  it("throws when getAll query fails", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(supabaseError("List failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(projectService.getAll()).rejects.toMatchObject({
      message: "List failed",
    });
  });

  it("creates and assigns project to headquarter when headquarterId is provided", async () => {
    const createProjectBuilder = createBuilder();
    createProjectBuilder.single.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_2", name: "Proyecto B" }),
    );

    const assignBuilder = createBuilder();
    assignBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => createProjectBuilder)
      .mockImplementationOnce(() => assignBuilder);

    const result = await projectService.create(
      { name: "Proyecto B", category: "Social" },
      "hq-1",
    );

    expect(result.project_id).toBe("p_2");
    expect(assignBuilder.insert).toHaveBeenCalledWith([
      {
        project_id: "p_2",
        headquarters_id: "hq-1",
      },
    ]);
  });

  it("creates project without headquarter assignment when headquarterId is not provided", async () => {
    const createProjectBuilder = createBuilder();
    createProjectBuilder.single.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_20", name: "Proyecto Solo" }),
    );

    clientMock.from.mockReturnValueOnce(createProjectBuilder);

    const result = await projectService.create({ name: "Proyecto Solo" });

    expect(result.project_id).toBe("p_20");
    expect(clientMock.from).toHaveBeenCalledTimes(1);
  });

  it("updates project and replaces headquarter relation", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_3", name: "Proyecto C" }),
    );

    const deleteRelationBuilder = createBuilder();
    deleteRelationBuilder.eq.mockResolvedValueOnce({ error: null });

    const assignBuilder = createBuilder();
    assignBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => updateBuilder)
      .mockImplementationOnce(() => deleteRelationBuilder)
      .mockImplementationOnce(() => assignBuilder);

    const result = await projectService.update(
      "p_3",
      { name: "Proyecto C editado" },
      "hq-9",
    );

    expect(result.project_id).toBe("p_3");
    expect(assignBuilder.insert).toHaveBeenCalled();
  });

  it("updates project without touching relations when newHeadquarterId is undefined", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_21", name: "Proyecto X" }),
    );

    clientMock.from.mockReturnValueOnce(updateBuilder);

    const result = await projectService.update("p_21", { name: "Proyecto X" });

    expect(result.project_id).toBe("p_21");
    expect(clientMock.from).toHaveBeenCalledTimes(1);
  });

  it("removes previous relations and skips assignment when newHeadquarterId is empty", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_22", name: "Proyecto Y" }),
    );

    const deleteRelationBuilder = createBuilder();
    deleteRelationBuilder.eq.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => updateBuilder)
      .mockImplementationOnce(() => deleteRelationBuilder);

    const result = await projectService.update(
      "p_22",
      { name: "Proyecto Y" },
      "",
    );

    expect(result.project_id).toBe("p_22");
    expect(clientMock.from).toHaveBeenCalledTimes(2);
  });

  it("returns total raised from donation amounts", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(
      supabaseOk([{ amount: 100 }, { amount: 250 }, { amount: 50 }]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const total = await projectService.getTotalRaised("p_5");

    expect(total).toBe(400);
  });

  it("returns zero total raised when there are no donations", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from.mockReturnValueOnce(builder);

    const total = await projectService.getTotalRaised("p_6");

    expect(total).toBe(0);
  });

  it("returns filtered projects by category, type and status", async () => {
    const categoryBuilder = createBuilder();
    categoryBuilder.order.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_cat" }]),
    );

    const typeBuilder = createBuilder();
    typeBuilder.order.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_type" }]),
    );

    const statusBuilder = createBuilder();
    statusBuilder.order.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_status" }]),
    );

    clientMock.from
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => typeBuilder)
      .mockImplementationOnce(() => statusBuilder);

    const byCategory = await projectService.getByCategory("Salud");
    const byType = await projectService.getByType("investment");
    const byStatus = await projectService.getByStatus("active");

    expect(byCategory[0].project_id).toBe("p_cat");
    expect(byType[0].project_id).toBe("p_type");
    expect(byStatus[0].project_id).toBe("p_status");
  });

  it("searches projects by text term", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_search", name: "Proyecto Salud" }]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await projectService.search("salud");

    expect(builder.or).toHaveBeenCalledWith(
      "name.ilike.%salud%,description.ilike.%salud%",
    );
    expect(result[0].project_id).toBe("p_search");
  });

  it("returns empty list when headquarter has no related projects", async () => {
    const relationBuilder = createBuilder();
    relationBuilder.eq.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from.mockReturnValueOnce(relationBuilder);

    const result = await projectService.getByHeadquarter("hq-empty");

    expect(result).toEqual([]);
  });

  it("returns projects by headquarter when relations exist", async () => {
    const relationBuilder = createBuilder();
    relationBuilder.eq.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_31" }, { project_id: "p_32" }]),
    );

    const projectsBuilder = createBuilder();
    projectsBuilder.order.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_31" }, { project_id: "p_32" }]),
    );

    clientMock.from
      .mockImplementationOnce(() => relationBuilder)
      .mockImplementationOnce(() => projectsBuilder);

    const result = await projectService.getByHeadquarter("hq-1");

    expect(result).toHaveLength(2);
    expect(projectsBuilder.in).toHaveBeenCalledWith("project_id", [
      "p_31",
      "p_32",
    ]);
  });

  it("throws when assignToHeadquarter fails", async () => {
    const builder = createBuilder();
    builder.insert.mockResolvedValueOnce(supabaseError("Assign failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      projectService.assignToHeadquarter("p_1", "hq-1"),
    ).rejects.toMatchObject({
      message: "Assign failed",
    });
  });

  it("removes relation from headquarter", async () => {
    const builder = createBuilder();
    builder.eq
      .mockImplementationOnce(() => builder)
      .mockResolvedValueOnce({
        error: null,
      });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      projectService.removeFromHeadquarter("p_1", "hq-1"),
    ).resolves.toBeUndefined();
  });

  it("throws when deleting project fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("Delete blocked"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(projectService.delete("p_1")).rejects.toMatchObject({
      message: "Delete blocked",
    });
  });

  it("throws on getById failure", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce(
      supabaseError("Project not found", "404"),
    );

    clientMock.from.mockReturnValueOnce(builder);

    await expect(projectService.getById("missing")).rejects.toMatchObject({
      message: "Project not found",
      code: "404",
    });
  });

  it("returns project by id on success", async () => {
    const builder = createBuilder();
    builder.maybeSingle.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_ok", name: "Proyecto OK" }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await projectService.getById("p_ok");

    expect(result.project_id).toBe("p_ok");
  });

  it("returns empty arrays for null data in filtered queries", async () => {
    const categoryBuilder = createBuilder();
    categoryBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const typeBuilder = createBuilder();
    typeBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const statusBuilder = createBuilder();
    statusBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    const searchBuilder = createBuilder();
    searchBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => typeBuilder)
      .mockImplementationOnce(() => statusBuilder)
      .mockImplementationOnce(() => searchBuilder);

    await expect(projectService.getByCategory("Social")).resolves.toEqual([]);
    await expect(projectService.getByType("investment")).resolves.toEqual([]);
    await expect(projectService.getByStatus("active")).resolves.toEqual([]);
    await expect(projectService.search("hola")).resolves.toEqual([]);
  });

  it("throws when filtered queries fail", async () => {
    const categoryBuilder = createBuilder();
    categoryBuilder.order.mockResolvedValueOnce(
      supabaseError("Category failed"),
    );

    const typeBuilder = createBuilder();
    typeBuilder.order.mockResolvedValueOnce(supabaseError("Type failed"));

    const statusBuilder = createBuilder();
    statusBuilder.order.mockResolvedValueOnce(supabaseError("Status failed"));

    const searchBuilder = createBuilder();
    searchBuilder.order.mockResolvedValueOnce(supabaseError("Search failed"));

    clientMock.from
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => typeBuilder)
      .mockImplementationOnce(() => statusBuilder)
      .mockImplementationOnce(() => searchBuilder);

    await expect(projectService.getByCategory("Social")).rejects.toMatchObject({
      message: "Category failed",
    });
    await expect(projectService.getByType("investment")).rejects.toMatchObject({
      message: "Type failed",
    });
    await expect(projectService.getByStatus("active")).rejects.toMatchObject({
      message: "Status failed",
    });
    await expect(projectService.search("hola")).rejects.toMatchObject({
      message: "Search failed",
    });
  });

  it("throws when getHeadquartersForProject fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("Headquarters failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      projectService.getHeadquartersForProject("p_1"),
    ).rejects.toMatchObject({
      message: "Headquarters failed",
    });
  });

  it("throws when relation query fails in getByHeadquarter", async () => {
    const relationBuilder = createBuilder();
    relationBuilder.eq.mockResolvedValueOnce(supabaseError("Relation failed"));

    clientMock.from.mockReturnValueOnce(relationBuilder);

    await expect(projectService.getByHeadquarter("hq-1")).rejects.toMatchObject(
      {
        message: "Relation failed",
      },
    );
  });

  it("continues relation replacement even when delete returns an error object", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(
      supabaseOk({ project_id: "p_99", name: "Proyecto Z" }),
    );

    const deleteRelationBuilder = createBuilder();
    deleteRelationBuilder.eq.mockResolvedValueOnce(
      supabaseError("Delete relation failed"),
    );

    const assignBuilder = createBuilder();
    assignBuilder.insert.mockResolvedValueOnce({ error: null });

    clientMock.from
      .mockImplementationOnce(() => updateBuilder)
      .mockImplementationOnce(() => deleteRelationBuilder)
      .mockImplementationOnce(() => assignBuilder);

    const result = await projectService.update(
      "p_99",
      { name: "Proyecto Z" },
      "hq-2",
    );

    expect(result.project_id).toBe("p_99");
    expect(assignBuilder.insert).toHaveBeenCalledWith([
      { project_id: "p_99", headquarters_id: "hq-2" },
    ]);
  });

  it("throws when removeFromHeadquarter fails", async () => {
    const builder = createBuilder();
    builder.eq
      .mockImplementationOnce(() => builder)
      .mockResolvedValueOnce(supabaseError("Remove failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      projectService.removeFromHeadquarter("p_1", "hq-1"),
    ).rejects.toMatchObject({
      message: "Remove failed",
    });
  });

  it("returns empty headquarters list when relation data is null", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    const result = await projectService.getHeadquartersForProject("p_1");

    expect(result).toEqual([]);
  });

  it("returns empty array when getAll has null data", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from.mockReturnValueOnce(builder);

    await expect(projectService.getAll()).resolves.toEqual([]);
  });

  it("throws when create query fails", async () => {
    const createProjectBuilder = createBuilder();
    createProjectBuilder.single.mockResolvedValueOnce(
      supabaseError("Create failed"),
    );

    clientMock.from.mockReturnValueOnce(createProjectBuilder);

    await expect(
      projectService.create({ name: "Proyecto" }),
    ).rejects.toMatchObject({
      message: "Create failed",
    });
  });

  it("throws when update query fails", async () => {
    const updateBuilder = createBuilder();
    updateBuilder.single.mockResolvedValueOnce(supabaseError("Update failed"));

    clientMock.from.mockReturnValueOnce(updateBuilder);

    await expect(
      projectService.update("p_500", { name: "Proyecto 500" }),
    ).rejects.toMatchObject({
      message: "Update failed",
    });
  });

  it("throws when projects list query fails inside getByHeadquarter", async () => {
    const relationBuilder = createBuilder();
    relationBuilder.eq.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_1" }]),
    );

    const projectsBuilder = createBuilder();
    projectsBuilder.order.mockResolvedValueOnce(
      supabaseError("Projects failed"),
    );

    clientMock.from
      .mockImplementationOnce(() => relationBuilder)
      .mockImplementationOnce(() => projectsBuilder);

    await expect(projectService.getByHeadquarter("hq-1")).rejects.toMatchObject(
      {
        message: "Projects failed",
      },
    );
  });

  it("returns empty array when second query in getByHeadquarter has null data", async () => {
    const relationBuilder = createBuilder();
    relationBuilder.eq.mockResolvedValueOnce(
      supabaseOk([{ project_id: "p_1" }]),
    );

    const projectsBuilder = createBuilder();
    projectsBuilder.order.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => relationBuilder)
      .mockImplementationOnce(() => projectsBuilder);

    await expect(projectService.getByHeadquarter("hq-1")).resolves.toEqual([]);
  });

  it("throws when getTotalRaised query fails", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(supabaseError("Totals failed"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(projectService.getTotalRaised("p_5")).rejects.toMatchObject({
      message: "Totals failed",
    });
  });

  it("adds zero when a donation amount is null", async () => {
    const builder = createBuilder();
    builder.eq.mockResolvedValueOnce(
      supabaseOk([{ amount: 100 }, { amount: null }, { amount: 25 }]),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const total = await projectService.getTotalRaised("p_5");

    expect(total).toBe(125);
  });
});
