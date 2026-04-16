import { act, renderHook, waitFor } from "@testing-library/react";
import { useSedeEvaluations } from "@/hooks/useSedeEvaluations";

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

const getByIdHeadquarterMock = jest.fn();
const getByDirectorIdHeadquarterMock = jest.fn();
const searchByNameHeadquarterMock = jest.fn();

const getByIdUserMock = jest.fn();

const getByHeadquarterIdEvaluationMock = jest.fn();
const deleteEvaluationMock = jest.fn();
const generateEvaluationsPDFMock = jest.fn();

const useAuthMock = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: (...args: unknown[]) => useAuthMock(...args),
}));

jest.mock("@/lib/reportGenerator", () => ({
  generateEvaluationsPDF: (...args: unknown[]) =>
    generateEvaluationsPDFMock(...args),
}));

jest.mock("@/api/services", () => ({
  evaluationService: {
    getByHeadquarterId: (...args: unknown[]) =>
      getByHeadquarterIdEvaluationMock(...args),
    deleteEvaluation: (...args: unknown[]) => deleteEvaluationMock(...args),
  },
  headquarterService: {
    getById: (...args: unknown[]) => getByIdHeadquarterMock(...args),
    getByDirectorId: (...args: unknown[]) =>
      getByDirectorIdHeadquarterMock(...args),
    searchByName: (...args: unknown[]) => searchByNameHeadquarterMock(...args),
  },
  userService: {
    getById: (...args: unknown[]) => getByIdUserMock(...args),
  },
}));

describe("useSedeEvaluations unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuthMock.mockReturnValue({
      user: {
        id: "u-1",
        headquarter_id: "hq-1",
        user_metadata: {},
      },
      isLoading: false,
    });

    getByIdHeadquarterMock.mockResolvedValue({
      headquarters_id: "hq-1",
      name: "Sede Norte",
    });

    getByIdUserMock.mockResolvedValue(null);
    getByDirectorIdHeadquarterMock.mockResolvedValue([]);
    searchByNameHeadquarterMock.mockResolvedValue([]);

    getByHeadquarterIdEvaluationMock.mockResolvedValue([
      {
        beneficiary_id: "b-1",
        evaluation: {
          id: "e-2",
          created_at: "2026-02-02",
          type: "technical_tactic",
          technical_tactic_detail: { pase: 5 },
        },
        beneficiary: {
          first_name: "Ana",
          last_name: "Lopez",
        },
      },
      {
        beneficiary_id: "b-2",
        evaluation: {
          id: "e-1",
          created_at: "2026-01-01",
          type: "anthropometric",
          anthropometric_detail: { peso: 40, talla: 140 },
        },
        beneficiary: {
          first_name: "Carlos",
          last_name: "Perez",
        },
      },
    ]);

    deleteEvaluationMock.mockResolvedValue(undefined);
  });

  it("loads assigned headquarter and mapped evaluations", async () => {
    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.assignedHeadquarterId).toBe("hq-1");
    });

    expect(result.current.assignedHeadquarterName).toBe("Sede Norte");
    expect(result.current.evaluations).toHaveLength(2);
    expect(result.current.evaluations[0].id).toBe("e-2");
    expect(result.current.evaluations[0].beneficiaryName).toBe("Ana Lopez");
    expect(result.current.evaluations[0].score).toBe(100);
  });

  it("exports a PDF for a selected evaluation type", async () => {
    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.exportEvaluationsByType("ANTHROPOMETRIC");
    });

    expect(generateEvaluationsPDFMock).toHaveBeenCalledTimes(1);
    expect(generateEvaluationsPDFMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          beneficiaryName: "Carlos Perez",
          type: "ANTHROPOMETRIC",
        }),
      ]),
      "evaluaciones_anthropometric",
      expect.objectContaining({
        generatedBy: "Director de sede",
        headquartersName: "Sede Norte",
      }),
    );
  });

  it("falls back to metadata search when user has no direct headquarter", async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "u-2",
        headquarter_id: null,
        user_metadata: {
          sede: "Centro",
        },
      },
      isLoading: false,
    });

    getByIdUserMock.mockResolvedValueOnce({ headquarter_id: null });
    getByDirectorIdHeadquarterMock.mockResolvedValueOnce([]);
    searchByNameHeadquarterMock.mockResolvedValueOnce([
      {
        headquarters_id: "hq-meta",
        name: "Centro",
      },
    ]);

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.assignedHeadquarterId).toBe("hq-meta");
    });

    expect(searchByNameHeadquarterMock).toHaveBeenCalledWith("Centro");
  });

  it("resolves headquarter from db user headquarter_id when auth user has none", async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "u-db",
        headquarter_id: null,
        user_metadata: {},
      },
      isLoading: false,
    });

    getByIdUserMock.mockResolvedValueOnce({ headquarter_id: "hq-db-1" });
    getByIdHeadquarterMock.mockResolvedValueOnce({
      headquarters_id: "hq-db-1",
      name: "Sede DB",
    });

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.assignedHeadquarterId).toBe("hq-db-1");
    });

    expect(result.current.assignedHeadquarterName).toBe("Sede DB");
    expect(getByDirectorIdHeadquarterMock).not.toHaveBeenCalled();
  });

  it("resolves headquarter directly from metadata id", async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "u-3",
        headquarter_id: null,
        user_metadata: {
          headquarters_id: "hq-meta-id",
        },
      },
      isLoading: false,
    });

    getByIdUserMock.mockResolvedValueOnce({ headquarter_id: null });
    getByDirectorIdHeadquarterMock.mockResolvedValueOnce([]);
    getByIdHeadquarterMock.mockResolvedValueOnce({
      headquarters_id: "hq-meta-id",
      name: "Sede Meta",
    });

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.assignedHeadquarterId).toBe("hq-meta-id");
    });
  });

  it("shows unassigned-headquarter toast when no resolution path returns a sede", async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "u-4",
        headquarter_id: null,
        user_metadata: {},
      },
      isLoading: false,
    });

    getByIdUserMock.mockResolvedValueOnce({ headquarter_id: null });
    getByDirectorIdHeadquarterMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.assignedHeadquarterId).toBeNull();
    });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Sede no asignada",
      expect.any(Object),
    );
  });

  it("shows loading-sede toast when headquarter resolution throws", async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "u-5",
        headquarter_id: "hq-err",
        user_metadata: {},
      },
      isLoading: false,
    });

    getByIdHeadquarterMock.mockRejectedValueOnce(new Error("hq error"));

    renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Sede no asignada",
        expect.any(Object),
      );
    });
  });

  it("handles evaluation loading errors", async () => {
    getByHeadquarterIdEvaluationMock.mockRejectedValueOnce(
      new Error("eval error"),
    );

    renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Error al cargar evaluaciones",
        expect.any(Object),
      );
    });
  });

  it("shows session error when authenticated user id is missing", async () => {
    useAuthMock.mockReturnValue({
      user: null,
      isLoading: false,
    });

    renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Sesion invalida",
        expect.any(Object),
      );
    });
  });

  it("keeps evaluations empty and loading false when no headquarter is assigned", async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "u-no-hq",
        headquarter_id: null,
        user_metadata: {},
      },
      isLoading: false,
    });

    getByIdUserMock.mockResolvedValueOnce({ headquarter_id: null });
    getByDirectorIdHeadquarterMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.assignedHeadquarterId).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evaluations).toEqual([]);
    expect(getByHeadquarterIdEvaluationMock).not.toHaveBeenCalled();
  });

  it("handles errors while resolving assigned headquarter", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "director-err", headquarter_id: null, user_metadata: {} },
      isLoading: false,
    });
    getByIdUserMock.mockResolvedValue({
      id: "director-err",
      headquarter_id: null,
    });
    getByDirectorIdHeadquarterMock.mockRejectedValue(
      new Error("director lookup failed"),
    );

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al cargar sede", {
      description: "No se pudo obtener la sede asignada.",
    });
    expect(result.current.assignedHeadquarterId).toBeNull();
    expect(result.current.assignedHeadquarterName).toBeNull();
  });

  it("deletes evaluation and refreshes list", async () => {
    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.assignedHeadquarterId).toBe("hq-1");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callsBeforeDelete =
      getByHeadquarterIdEvaluationMock.mock.calls.length;

    await act(async () => {
      await result.current.handleDeleteEvaluation("e-2");
    });

    expect(deleteEvaluationMock).toHaveBeenCalledWith("e-2");
    expect(getByHeadquarterIdEvaluationMock.mock.calls.length).toBe(
      callsBeforeDelete + 1,
    );
    expect(toastSuccessMock).toHaveBeenCalledWith("Evaluacion eliminada");
  });

  it("shows error toast when deleting evaluation fails", async () => {
    deleteEvaluationMock.mockRejectedValueOnce(new Error("delete failed"));

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteEvaluation("e-9");
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al eliminar evaluacion");
  });

  it("formats date and type labels", async () => {
    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.formatDate("2026-02-10")).toContain("2026");
    expect(result.current.getEvaluationTypeLabel("anthropometric")).toBe(
      "Antropométrica",
    );
  });

  it("refresh reloads evaluations and maps fallback beneficiary/date/comments", async () => {
    getByHeadquarterIdEvaluationMock.mockResolvedValue([
      {
        beneficiary_id: "b-fallback",
        evaluation: {
          id: "e-fallback",
          created_at: null,
          type: "psychological_emotional",
          emotional_detail: null,
        },
        beneficiary: {
          first_name: null,
          last_name: null,
        },
      },
      {
        beneficiary_id: null,
        evaluation: {
          id: "e-ignored",
          created_at: "2026-01-01",
          type: "anthropometric",
          anthropometric_detail: {},
        },
        beneficiary: {
          first_name: "X",
          last_name: "Y",
        },
      },
    ]);

    const { result } = renderHook(() => useSedeEvaluations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.evaluations).toHaveLength(1);
    expect(result.current.evaluations[0].beneficiaryName).toBe("Beneficiario");
    expect(result.current.evaluations[0].comments).toBe("");
    expect(typeof result.current.evaluations[0].date).toBe("string");
  });
});
