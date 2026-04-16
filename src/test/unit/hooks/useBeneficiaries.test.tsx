import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

const getAllBeneficiariesMock = jest.fn();
const countEvaluationsMock = jest.fn();
const deleteBeneficiaryMock = jest.fn();
const createBeneficiaryMock = jest.fn();
const updateBeneficiaryMock = jest.fn();
const uploadPhotoMock = jest.fn();

const getAllHeadquartersMock = jest.fn();
const getUserByIdMock = jest.fn();
const createSafeParseMock = jest.fn();
const updateSafeParseMock = jest.fn();
const generateExcelMock = jest.fn();
const generatePdfMock = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/api/services", () => ({
  beneficiaryService: {
    getAll: (...args: unknown[]) => getAllBeneficiariesMock(...args),
    countEvaluations: (...args: unknown[]) => countEvaluationsMock(...args),
    delete: (...args: unknown[]) => deleteBeneficiaryMock(...args),
    create: (...args: unknown[]) => createBeneficiaryMock(...args),
    update: (...args: unknown[]) => updateBeneficiaryMock(...args),
    uploadPhoto: (...args: unknown[]) => uploadPhotoMock(...args),
  },
  headquarterService: {
    getAll: (...args: unknown[]) => getAllHeadquartersMock(...args),
  },
  userService: {
    getById: (...args: unknown[]) => getUserByIdMock(...args),
  },
}));

jest.mock("@/lib/schemas/beneficiary.schema", () => ({
  createBeneficiarySchema: {
    safeParse: (...args: unknown[]) => createSafeParseMock(...args),
  },
  updateBeneficiarySchema: {
    safeParse: (...args: unknown[]) => updateSafeParseMock(...args),
  },
}));

jest.mock("@/lib/reportGenerator", () => ({
  generateBeneficiariesExcel: (...args: unknown[]) =>
    generateExcelMock(...args),
  generateBeneficiariesPDF: (...args: unknown[]) => generatePdfMock(...args),
}));

describe("useBeneficiaries unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { first_name: "Juan", last_name: "Pérez" },
      isLoading: false,
      isAuthenticated: true,
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    });

    getAllBeneficiariesMock.mockResolvedValue([
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
        performance: 80,
      },
      {
        beneficiary_id: "b-2",
        headquarters_id: "hq-2",
        first_name: "Carlos",
        last_name: "Perez",
        birth_date: "2011-01-01",
        category: "Categoría 2",
        phone: "456",
        registry_date: "2026-01-02",
        status: "inactivo",
        performance: 60,
      },
    ]);

    getAllHeadquartersMock.mockResolvedValue([
      { headquarters_id: "hq-1", name: "Sede Norte" },
      { headquarters_id: "hq-2", name: "Sede Sur" },
    ]);

    createBeneficiaryMock.mockResolvedValue({ beneficiary_id: "b-3" });
    updateBeneficiaryMock.mockResolvedValue({ beneficiary_id: "b-1" });
    uploadPhotoMock.mockResolvedValue("https://cdn.test/b-3.png");
    countEvaluationsMock.mockResolvedValue(0);
    getUserByIdMock.mockResolvedValue(null);
    createSafeParseMock.mockReturnValue({ success: true });
    updateSafeParseMock.mockReturnValue({ success: true });
  });

  it("loads initial beneficiaries and computes stats", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.headquartersLoading).toBe(false);
    });

    expect(result.current.beneficiaries).toHaveLength(2);
    expect(result.current.stats).toEqual({
      total: 2,
      active: 1,
      avgPerformance: 70,
    });
    expect(result.current.statsByHeadquarter).toHaveLength(2);
  });

  it("filters list by search and status", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearch("ana");
      result.current.setStatusFilter("activo");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].beneficiary_id).toBe("b-1");
  });

  it("prevents delete when beneficiary has evaluations", async () => {
    countEvaluationsMock.mockResolvedValueOnce(2);

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("b-1", "Ana Lopez");
    });

    expect(deleteBeneficiaryMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("creates beneficiary and reloads list", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleCreate({
        headquarters_id: "hq-1",
        first_name: "Nueva",
        last_name: "Persona",
        birth_date: "2014-01-01",
        category: "Categoría 1",
        phone: "123",
      });
      expect(ok).toBe(true);
    });

    expect(createBeneficiaryMock).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("returns false when create validation fails", async () => {
    createSafeParseMock.mockReturnValueOnce({
      success: false,
      error: { errors: [{ message: "Dato requerido" }] },
    });

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleCreate({
        headquarters_id: "hq-1",
        first_name: "",
        last_name: "Persona",
        birth_date: "2014-01-01",
        category: "Categoría 1",
        phone: "123",
      });
      expect(ok).toBe(false);
    });

    expect(createBeneficiaryMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("updates beneficiary successfully", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleUpdate("b-1", {
        first_name: "Ana",
        last_name: "Lopez",
      });
      expect(ok).toBe(true);
    });

    expect(updateBeneficiaryMock).toHaveBeenCalledWith("b-1", {
      first_name: "Ana",
      last_name: "Lopez",
      photo_url: undefined,
    });
  });

  it("uploads photo during create and updates beneficiary with returned url", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setPhotoFile(
        new File(["x"], "avatar.png", { type: "image/png" }),
      );
    });

    await act(async () => {
      const ok = await result.current.handleCreate({
        headquarters_id: "hq-1",
        first_name: "Nueva",
        last_name: "ConFoto",
        birth_date: "2014-01-01",
        category: "Categoría 1",
        phone: "123",
      });
      expect(ok).toBe(true);
    });

    expect(uploadPhotoMock).toHaveBeenCalledWith(
      "b-3",
      expect.objectContaining({ name: "avatar.png" }),
    );
    expect(updateBeneficiaryMock).toHaveBeenCalledWith("b-3", {
      photo_url: "https://cdn.test/b-3.png",
    });
  });

  it("returns false when update validation fails", async () => {
    updateSafeParseMock.mockReturnValueOnce({
      success: false,
      error: { errors: [{ message: "Dato inválido" }] },
    });

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleUpdate("b-1", {
        first_name: "",
      });
      expect(ok).toBe(false);
    });

    expect(updateBeneficiaryMock).not.toHaveBeenCalledWith("b-1", {
      first_name: "",
    });
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("uses create path in handleSave when editing without editId", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSave(
        {
          headquarters_id: "hq-1",
          first_name: "Save",
          last_name: "Create",
          birth_date: "2014-01-01",
          category: "Categoría 1",
          phone: "123",
        },
        true,
      );
      expect(ok).toBe(true);
    });

    expect(createBeneficiaryMock).toHaveBeenCalled();
  });

  it("uses update path in handleSave when editing with editId", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleSave(
        {
          first_name: "Edit",
          last_name: "ViaSave",
        },
        true,
        "b-1",
      );
      expect(ok).toBe(true);
    });

    expect(updateBeneficiaryMock).toHaveBeenCalledWith("b-1", {
      first_name: "Edit",
      last_name: "ViaSave",
      photo_url: undefined,
    });
  });

  it("uses fallback name fragments in update success message", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleUpdate("b-1", {
        phone: "999",
      });
      expect(ok).toBe(true);
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Beneficiario actualizado",
      expect.objectContaining({
        description: "  ha sido actualizado correctamente",
      }),
    );
  });

  it("handles beneficiaries loading error", async () => {
    getAllBeneficiariesMock.mockRejectedValueOnce(
      new Error("beneficiaries failed"),
    );

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.beneficiaries).toEqual([]);
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("returns false when update throws", async () => {
    updateBeneficiaryMock.mockRejectedValueOnce(new Error("update failed"));

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const ok = await result.current.handleUpdate("b-1", {
        first_name: "Ana",
      });
      expect(ok).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("deletes beneficiary when no evaluations exist", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("b-1", "Ana Lopez");
    });

    expect(deleteBeneficiaryMock).toHaveBeenCalledWith("b-1");
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("throws when delete fails", async () => {
    deleteBeneficiaryMock.mockRejectedValueOnce(new Error("delete failed"));

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      result.current.handleDelete("b-1", "Ana Lopez"),
    ).rejects.toMatchObject({
      message: "delete failed",
    });
  });

  it("exports filtered beneficiaries to excel and pdf", async () => {
    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleExportExcel();
      result.current.handleExportPDF();
    });

    expect(generateExcelMock).toHaveBeenCalled();
    expect(generatePdfMock).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("handles headquarters loading error", async () => {
    getAllHeadquartersMock.mockRejectedValueOnce(new Error("hq failed"));

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.headquartersLoading).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalled();
  });
});
