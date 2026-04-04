import { renderHook, waitFor, act } from "@testing-library/react";
import { useProjects } from "@/hooks/useProjects";

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

const getAllProjectsMock = jest.fn();
const getTotalRaisedMock = jest.fn();
const getHeadquartersForProjectMock = jest.fn();
const deleteProjectMock = jest.fn();
const createProjectMock = jest.fn();
const updateProjectMock = jest.fn();
const createProjectSafeParseMock = jest.fn();
const updateProjectSafeParseMock = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

jest.mock("@/api/services", () => ({
  projectService: {
    getAll: (...args: unknown[]) => getAllProjectsMock(...args),
    getTotalRaised: (...args: unknown[]) => getTotalRaisedMock(...args),
    getHeadquartersForProject: (...args: unknown[]) =>
      getHeadquartersForProjectMock(...args),
    delete: (...args: unknown[]) => deleteProjectMock(...args),
    create: (...args: unknown[]) => createProjectMock(...args),
    update: (...args: unknown[]) => updateProjectMock(...args),
  },
}));

jest.mock("@/lib/schemas/project.schema", () => ({
  createProjectSchema: {
    safeParse: (...args: unknown[]) => createProjectSafeParseMock(...args),
  },
  updateProjectSchema: {
    safeParse: (...args: unknown[]) => updateProjectSafeParseMock(...args),
  },
}));

describe("useProjects unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getAllProjectsMock.mockResolvedValue([
      {
        project_id: "project_1",
        name: "Proyecto A",
        category: "Social",
        type: "investment",
        finance_goal: 1000,
        end_date: "2026-12-31",
        description: "Desc",
        status: "active",
        start_date: "2026-01-01",
      },
    ]);
    getTotalRaisedMock.mockResolvedValue(400);
    getHeadquartersForProjectMock.mockResolvedValue(["hq-1"]);
    createProjectMock.mockResolvedValue({ project_id: "project_2" });
    updateProjectMock.mockResolvedValue({ project_id: "project_1" });
    createProjectSafeParseMock.mockReturnValue({ success: true });
    updateProjectSafeParseMock.mockReturnValue({ success: true });
  });

  it("loads projects and computes stats", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].progress).toBe(40);
    expect(result.current.stats.total).toBe(1);
    expect(result.current.stats.totalGoal).toBe(1000);
    expect(result.current.stats.totalRaised).toBe(400);
  });

  it("handles project mapping when goal is zero and no headquarters are linked", async () => {
    getAllProjectsMock.mockResolvedValueOnce([
      {
        project_id: "project_3",
        name: "Proyecto Libre",
        category: "Social",
        type: "free",
        finance_goal: null,
        end_date: "2026-12-31",
        description: "Desc",
        status: "active",
        start_date: "2026-01-01",
      },
    ]);
    getTotalRaisedMock.mockResolvedValueOnce(150);
    getHeadquartersForProjectMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    expect(result.current.projects[0].progress).toBe(0);
    expect(result.current.projects[0].headquarters_id).toBeUndefined();
    expect(result.current.stats.totalRaisedFree).toBe(150);
  });

  it("maps defaults when optional DB fields are missing", async () => {
    getAllProjectsMock.mockResolvedValueOnce([
      {
        project_id: "project",
        name: "Proyecto Sin Extras",
        category: null,
        type: null,
        finance_goal: 200,
        end_date: null,
        description: null,
        status: "pending",
        start_date: null,
      },
    ]);
    getTotalRaisedMock.mockResolvedValueOnce(20);
    getHeadquartersForProjectMock.mockResolvedValueOnce(["hq-9", "hq-2"]);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    expect(result.current.projects[0]).toMatchObject({
      id: 0,
      category: "Sin categoría",
      type: "investment",
      deadline: "",
      description: "",
      headquarters_id: "hq-9",
    });
  });

  it("prevents delete when project has donations", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    getTotalRaisedMock.mockResolvedValueOnce(120);

    await act(async () => {
      await result.current.handleDeleteProject("project_1", "Proyecto A");
    });

    expect(deleteProjectMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("formats currency and date helpers", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    expect(result.current.formatCurrency(1500)).toContain("1.500");
    expect(result.current.formatDate("2026-01-10")).toContain("2026");
  });

  it("deletes project when no donations exist", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    getTotalRaisedMock.mockResolvedValueOnce(0);

    await act(async () => {
      await result.current.handleDeleteProject("project_1", "Proyecto A");
    });

    expect(deleteProjectMock).toHaveBeenCalledWith("project_1");
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("falls back to create flow when editing has no editId", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSaveProject(
        {
          name: "Nuevo sin editId",
          category: "Social",
        },
        true,
      );
      expect(ok).toBe(true);
    });

    expect(toastSuccessMock).toHaveBeenCalled();
    expect(createProjectMock).toHaveBeenCalled();
  });

  it("runs update flow when editing has editId", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSaveProject(
        {
          name: "Proyecto Editado",
        },
        true,
        "project_1",
        "hq-1",
      );
      expect(ok).toBe(true);
    });

    expect(updateProjectMock).toHaveBeenCalledWith(
      "project_1",
      { name: "Proyecto Editado" },
      "hq-1",
    );
  });

  it("returns false when update schema validation fails", async () => {
    updateProjectSafeParseMock.mockReturnValueOnce({
      success: false,
      error: {
        errors: [{ message: "Dato inválido" }],
      },
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSaveProject(
        {
          name: "Proyecto Editado",
        },
        true,
        "project_1",
      );
      expect(ok).toBe(false);
    });

    expect(updateProjectMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("returns false when update throws", async () => {
    updateProjectMock.mockRejectedValueOnce(new Error("update failed"));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleEditProject(
        "project_1",
        { name: "Proyecto A" },
        "hq-1",
      );
      expect(ok).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("uses fallback success description in handleEditProject when name is missing", async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleEditProject("project_1", {});
      expect(ok).toBe(true);
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Proyecto actualizado",
      expect.objectContaining({
        description: "El proyecto ha sido actualizado correctamente",
      }),
    );
  });

  it("returns false when schema throws unexpectedly in handleSaveProject", async () => {
    createProjectSafeParseMock.mockImplementationOnce(() => {
      throw new Error("schema crash");
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSaveProject(
        { name: "Proyecto" },
        false,
      );
      expect(ok).toBe(false);
    });
  });

  it("returns false when create schema validation fails", async () => {
    createProjectSafeParseMock.mockReturnValueOnce({
      success: false,
      error: {
        errors: [{ message: "Nombre requerido" }],
      },
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSaveProject(
        {
          name: "",
        },
        false,
      );
      expect(ok).toBe(false);
    });

    expect(createProjectMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("returns false when create throws", async () => {
    createProjectMock.mockRejectedValueOnce(new Error("create failed"));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleCreateProject({ name: "Nuevo" });
      expect(ok).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("throws from delete flow when service delete fails", async () => {
    deleteProjectMock.mockRejectedValueOnce(new Error("delete failed"));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    getTotalRaisedMock.mockResolvedValueOnce(0);

    await expect(
      result.current.handleDeleteProject("project_1", "Proyecto A"),
    ).rejects.toMatchObject({
      message: "delete failed",
    });

    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("handles loadProjects failures with error toast", async () => {
    getAllProjectsMock.mockRejectedValueOnce(new Error("DB down"));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalled();
    expect(result.current.projects).toEqual([]);
  });
});
