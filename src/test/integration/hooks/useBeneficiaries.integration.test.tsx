import { renderHook, waitFor, act } from "@testing-library/react";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

const getAllBeneficiariesMock = jest.fn();
const createBeneficiaryMock = jest.fn();
const updateBeneficiaryMock = jest.fn();
const uploadPhotoMock = jest.fn();

const getAllHeadquartersMock = jest.fn();

const createSafeParseMock = jest.fn();
const updateSafeParseMock = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

jest.mock("@/api/services", () => ({
  beneficiaryService: {
    getAll: (...args: unknown[]) => getAllBeneficiariesMock(...args),
    create: (...args: unknown[]) => createBeneficiaryMock(...args),
    update: (...args: unknown[]) => updateBeneficiaryMock(...args),
    uploadPhoto: (...args: unknown[]) => uploadPhotoMock(...args),
    countEvaluations: jest.fn(),
    delete: jest.fn(),
  },
  headquarterService: {
    getAll: (...args: unknown[]) => getAllHeadquartersMock(...args),
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
  generateBeneficiariesExcel: jest.fn(),
  generateBeneficiariesPDF: jest.fn(),
}));

describe("useBeneficiaries integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    createSafeParseMock.mockReturnValue({ success: true });
    updateSafeParseMock.mockReturnValue({ success: true });

    getAllBeneficiariesMock.mockResolvedValue([]);
    getAllHeadquartersMock.mockResolvedValue([]);
  });

  it("integrates create flow and triggers reload", async () => {
    createBeneficiaryMock.mockResolvedValueOnce({ beneficiary_id: "b-100" });

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.handleCreate({
        headquarters_id: "hq-1",
        first_name: "Laura",
        last_name: "Rincon",
        birth_date: "2012-05-05",
        category: "Categoría 1",
        phone: "300",
      });
      expect(created).toBe(true);
    });

    expect(createBeneficiaryMock).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(getAllBeneficiariesMock).toHaveBeenCalledTimes(2);
  });

  it("returns false and toast on validation error", async () => {
    createSafeParseMock.mockReturnValueOnce({
      success: false,
      error: {
        errors: [{ message: "Campo requerido" }],
      },
    });

    const { result } = renderHook(() => useBeneficiaries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.handleCreate({
        headquarters_id: "hq-1",
        first_name: "",
        last_name: "Rincon",
        birth_date: "2012-05-05",
        category: "Categoría 1",
        phone: "300",
      });
      expect(created).toBe(false);
    });

    expect(createBeneficiaryMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });
});
