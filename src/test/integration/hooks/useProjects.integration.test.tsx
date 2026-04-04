import { renderHook, waitFor, act } from "@testing-library/react";
import { useProjects } from "@/hooks/useProjects";

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

const getAllProjectsMock = jest.fn();
const getTotalRaisedMock = jest.fn();
const getHeadquartersForProjectMock = jest.fn();
const createProjectMock = jest.fn();
const updateProjectMock = jest.fn();

const createSafeParseMock = jest.fn();
const updateSafeParseMock = jest.fn();

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
    create: (...args: unknown[]) => createProjectMock(...args),
    update: (...args: unknown[]) => updateProjectMock(...args),
    delete: jest.fn(),
  },
}));

jest.mock("@/lib/schemas/project.schema", () => ({
  createProjectSchema: {
    safeParse: (...args: unknown[]) => createSafeParseMock(...args),
  },
  updateProjectSchema: {
    safeParse: (...args: unknown[]) => updateSafeParseMock(...args),
  },
}));

describe("useProjects integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    createSafeParseMock.mockReturnValue({ success: true });
    updateSafeParseMock.mockReturnValue({ success: true });

    getAllProjectsMock.mockResolvedValue([]);
    getTotalRaisedMock.mockResolvedValue(0);
    getHeadquartersForProjectMock.mockResolvedValue([]);
  });

  it("integrates create flow via handleSaveProject", async () => {
    createProjectMock.mockResolvedValueOnce({ project_id: "project_9" });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projectsLoading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSaveProject(
        {
          name: "Proyecto Nuevo",
          category: "Educacion",
        },
        false,
        undefined,
        "hq-1",
      );
      expect(ok).toBe(true);
    });

    expect(createProjectMock).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("integrates update flow via handleSaveProject", async () => {
    updateProjectMock.mockResolvedValueOnce({ project_id: "project_3" });

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
        "project_3",
        "hq-2",
      );
      expect(ok).toBe(true);
    });

    expect(updateProjectMock).toHaveBeenCalledWith(
      "project_3",
      { name: "Proyecto Editado" },
      "hq-2",
    );
  });

  it("returns false on validation errors", async () => {
    createSafeParseMock.mockReturnValueOnce({
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
      const ok = await result.current.handleSaveProject({ name: "" }, false);
      expect(ok).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalled();
    expect(createProjectMock).not.toHaveBeenCalled();
  });
});
