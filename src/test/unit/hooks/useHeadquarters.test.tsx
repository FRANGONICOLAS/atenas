import { act, renderHook, waitFor } from "@testing-library/react";
import { useHeadquarters } from "@/hooks/useHeadquarters";

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

const useAuthMock = jest.fn();

const getAllHeadquartersMock = jest.fn();
const createHeadquarterMock = jest.fn();
const updateHeadquarterMock = jest.fn();
const deleteHeadquarterMock = jest.fn();
const uploadImageHeadquarterMock = jest.fn();

const getAllBeneficiariesMock = jest.fn();
let markerClickHandler: (() => void) | undefined;

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: (...args: unknown[]) => useAuthMock(...args),
}));

jest.mock("@/api/services", () => ({
  headquarterService: {
    getAll: (...args: unknown[]) => getAllHeadquartersMock(...args),
    create: (...args: unknown[]) => createHeadquarterMock(...args),
    update: (...args: unknown[]) => updateHeadquarterMock(...args),
    delete: (...args: unknown[]) => deleteHeadquarterMock(...args),
    uploadImage: (...args: unknown[]) => uploadImageHeadquarterMock(...args),
  },
  beneficiaryService: {
    getAll: (...args: unknown[]) => getAllBeneficiariesMock(...args),
  },
}));

jest.mock("leaflet", () => {
  const mapInstance = {
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    fitBounds: jest.fn(),
    removeLayer: jest.fn(),
  };

  const featureGroup = {
    addLayer: jest.fn(),
    addTo: jest.fn(),
    getBounds: jest.fn(() => ({})),
  };

  const markerInstance = {
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn((_event: string, cb: () => void) => {
      markerClickHandler = cb;
      return markerInstance;
    }),
  };

  return {
    __esModule: true,
    default: {
      map: jest.fn(() => mapInstance),
      tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
      featureGroup: jest.fn(() => featureGroup),
      marker: jest.fn(() => markerInstance),
      divIcon: jest.fn(() => ({ icon: true })),
    },
  };
});

describe("useHeadquarters unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markerClickHandler = undefined;

    useAuthMock.mockReturnValue({
      user: { id: "user-1" },
    });

    getAllHeadquartersMock.mockResolvedValue([
      {
        headquarters_id: "hq-1",
        name: "Sede Norte",
        status: "active",
        address: "Calle 1",
        city: "Cali",
        image_url: null,
      },
      {
        headquarters_id: "hq-2",
        name: "Sede Sur",
        status: "maintenance",
        address: "Calle 2",
        city: "Cali",
        image_url: null,
      },
    ]);

    getAllBeneficiariesMock.mockResolvedValue([
      { beneficiary_id: "b-1", headquarters_id: "hq-1", status: "activo" },
      { beneficiary_id: "b-2", headquarters_id: "hq-1", status: "inactivo" },
      { beneficiary_id: "b-3", headquarters_id: "hq-2", status: "activo" },
    ]);

    createHeadquarterMock.mockResolvedValue({
      headquarters_id: "hq-new",
      name: "Sede Nueva",
    });
    updateHeadquarterMock.mockResolvedValue({ headquarters_id: "hq-1" });
    deleteHeadquarterMock.mockResolvedValue(undefined);
    uploadImageHeadquarterMock.mockResolvedValue("https://cdn.test/hq.png");
  });

  it("loads initial headquarters and beneficiary stats", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.headquarters).toHaveLength(2);
    expect(result.current.stats).toEqual({ total: 2, active: 1 });

    const statsMap = result.current.beneficiariesByHeadquarter;
    expect(statsMap.get("hq-1")).toEqual({ total: 2, active: 1 });
    expect(statsMap.get("hq-2")).toEqual({ total: 1, active: 1 });
  });

  it("opens create mode and edit mode", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openCreate();
    });

    expect(result.current.showDialog).toBe(true);
    expect(result.current.editing).toBeNull();
    expect(result.current.form.name).toBe("");

    act(() => {
      result.current.openEdit({
        headquarters_id: "hq-1",
        name: "Sede Norte",
        status: "active",
        address: "Calle 1",
        city: "Cali",
        image_url: null,
      } as never);
    });

    expect(result.current.editing?.headquarters_id).toBe("hq-1");
    expect(result.current.form.name).toBe("Sede Norte");
  });

  it("validates required fields before save", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openCreate();
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Campos requeridos",
      expect.any(Object),
    );
    expect(createHeadquarterMock).not.toHaveBeenCalled();
  });

  it("creates headquarter and closes dialog", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openCreate();
      result.current.setForm({
        name: "Sede Nueva",
        status: "active",
        address: "Av 3",
        city: "Cali",
        image_url: null,
      });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(createHeadquarterMock).toHaveBeenCalledWith({
      name: "Sede Nueva",
      status: "active",
      address: "Av 3",
      city: "Cali",
      image_url: null,
      user_id: "user-1",
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Sede creada",
      expect.any(Object),
    );
  });

  it("updates headquarter and uploads image when editing", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openEdit({
        headquarters_id: "hq-1",
        name: "Sede Norte",
        status: "active",
        address: "Calle 1",
        city: "Cali",
        image_url: null,
      } as never);
      result.current.setImageFile(
        new File(["img"], "hq.png", { type: "image/png" }),
      );
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(uploadImageHeadquarterMock).toHaveBeenCalled();
    expect(updateHeadquarterMock).toHaveBeenCalledWith(
      "hq-1",
      expect.objectContaining({ image_url: "https://cdn.test/hq.png" }),
    );
  });

  it("handles delete and status toggle", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("hq-1");
    });

    await act(async () => {
      await result.current.toggleStatus("hq-2", "inactive");
    });

    expect(deleteHeadquarterMock).toHaveBeenCalledWith("hq-1");
    expect(updateHeadquarterMock).toHaveBeenCalledWith("hq-2", {
      status: "inactive",
    });
  });

  it("filters headquarters by term and status", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearch("norte");
      result.current.setStatusFilter("active");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].headquarters_id).toBe("hq-1");
  });

  it("validates address/city and user before save", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openCreate();
      result.current.setForm({
        name: "Sede X",
        status: "active",
        address: "",
        city: "",
        image_url: null,
      });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Campos requeridos",
      expect.any(Object),
    );

    useAuthMock.mockReturnValue({ user: null, isLoading: false });
    const { result: noUserResult } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(noUserResult.current.loading).toBe(false);
    });

    act(() => {
      noUserResult.current.openCreate();
      noUserResult.current.setForm({
        name: "Sede X",
        status: "active",
        address: "Av 1",
        city: "Cali",
        image_url: null,
      });
    });

    await act(async () => {
      await noUserResult.current.handleSave();
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error", expect.any(Object));
  });

  it("handles create/update/delete/toggle/load errors", async () => {
    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    createHeadquarterMock.mockRejectedValueOnce(new Error("create failed"));
    act(() => {
      result.current.openCreate();
      result.current.setForm({
        name: "Sede Nueva",
        status: "active",
        address: "Av 3",
        city: "Cali",
        image_url: null,
      });
    });
    await act(async () => {
      await result.current.handleSave();
    });

    updateHeadquarterMock.mockRejectedValueOnce(new Error("update failed"));
    act(() => {
      result.current.openEdit({
        headquarters_id: "hq-1",
        name: "Sede Norte",
        status: "active",
        address: "Calle 1",
        city: "Cali",
        image_url: null,
      } as never);
    });
    await act(async () => {
      await result.current.handleSave();
    });

    deleteHeadquarterMock.mockRejectedValueOnce(new Error("delete failed"));
    await act(async () => {
      await result.current.handleDelete("hq-1");
    });

    updateHeadquarterMock.mockRejectedValueOnce(new Error("toggle failed"));
    await act(async () => {
      await result.current.toggleStatus("hq-2", "inactive");
    });

    getAllHeadquartersMock.mockRejectedValueOnce(new Error("load failed"));
    const { result: loadErrorResult } = renderHook(() => useHeadquarters());
    await waitFor(() => {
      expect(loadErrorResult.current.loading).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al guardar la sede");
    expect(toastErrorMock).toHaveBeenCalledWith("Error al eliminar la sede");
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Error al actualizar el estado",
    );
    expect(toastErrorMock).toHaveBeenCalledWith("Error al cargar las sedes");
  });

  it("handles beneficiaries load error and still exposes headquarters", async () => {
    getAllBeneficiariesMock.mockRejectedValueOnce(
      new Error("beneficiaries failed"),
    );

    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.headquarters).toHaveLength(2);
  });

  it("initializes map and processes geocoding/marker branches", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => [
        {
          lat: "3.45",
          lon: "-76.53",
          display_name: "Cali",
        },
      ],
    });

    (globalThis as unknown as { fetch: jest.Mock }).fetch =
      fetchMock as unknown as jest.Mock;

    const { result } = renderHook(() => useHeadquarters());
    result.current.mapRef.current = document.createElement("div");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.setSelectedHeadquarter(
        result.current.headquarters[0] || null,
      );
    });

    expect(result.current.selectedHeadquarter?.headquarters_id).toBe("hq-1");
  });

  it("handles no valid coordinates when headquarters are not geocodable", async () => {
    getAllHeadquartersMock.mockResolvedValueOnce([
      {
        headquarters_id: "hq-no-address",
        name: "Sede Sin Direccion",
        status: "active",
        address: "",
        city: "Cali",
        image_url: null,
      },
      {
        headquarters_id: "hq-inactive",
        name: "Sede Inactiva",
        status: "inactive",
        address: "Calle 99",
        city: "Cali",
        image_url: null,
      },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => [],
    });

    (globalThis as unknown as { fetch: jest.Mock }).fetch =
      fetchMock as unknown as jest.Mock;

    const { result } = renderHook(() => useHeadquarters());
    result.current.mapRef.current = document.createElement("div");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // No fetch should happen because one hq has no address and the other is inactive.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("caches failed geocoding results and avoids repeating fetch for same address", async () => {
    const sharedHeadquarters = [
      {
        headquarters_id: "hq-cache-1",
        name: "Sede Cache 1",
        status: "active",
        address: "Calle Cache",
        city: "Cali",
        image_url: null,
      },
      {
        headquarters_id: "hq-cache-2",
        name: "Sede Cache 2",
        status: "active",
        address: "Calle Cache",
        city: "Cali",
        image_url: null,
      },
    ];

    getAllHeadquartersMock.mockResolvedValue(sharedHeadquarters);

    const fetchMock = jest.fn().mockRejectedValue(new Error("geocode failed"));
    (globalThis as unknown as { fetch: jest.Mock }).fetch =
      fetchMock as unknown as jest.Mock;

    const { result } = renderHook(() => useHeadquarters());
    result.current.mapRef.current = document.createElement("div");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const callsAfterFirstLoad = fetchMock.mock.calls.length;

    // Force a second load with the same addresses so cached null path is exercised.
    getAllHeadquartersMock.mockResolvedValueOnce(sharedHeadquarters);
    await act(async () => {
      await result.current.toggleStatus("hq-cache-1", "active");
    });

    expect(fetchMock.mock.calls.length).toBe(callsAfterFirstLoad);
  });

  it("reuses cached coordinates on second marker refresh and removes previous layer", async () => {
    const sharedHeadquarters = [
      {
        headquarters_id: "hq-cache-ok-1",
        name: "Sede Cache OK 1",
        status: "active",
        address: "Calle Reuse",
        city: "Cali",
        image_url: null,
      },
      {
        headquarters_id: "hq-cache-ok-2",
        name: "Sede Cache OK 2",
        status: "active",
        address: "Calle Reuse 2",
        city: "Cali",
        image_url: null,
      },
    ];

    getAllHeadquartersMock.mockResolvedValue(sharedHeadquarters);

    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => [
        {
          lat: "3.45",
          lon: "-76.53",
          display_name: "Cali",
        },
      ],
    });
    (globalThis as unknown as { fetch: jest.Mock }).fetch =
      fetchMock as unknown as jest.Mock;

    const { result } = renderHook(() => useHeadquarters());
    result.current.mapRef.current = document.createElement("div");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Trigger marker click callback path.
    act(() => {
      markerClickHandler?.();
    });
    expect(result.current.selectedHeadquarter?.headquarters_id).toBe(
      "hq-cache-ok-2",
    );

    // Second refresh with same addresses should hit cache and avoid fetch calls.
    getAllHeadquartersMock.mockResolvedValueOnce(sharedHeadquarters);
    await act(async () => {
      await result.current.toggleStatus("hq-cache-ok-1", "active");
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("handles geocoding service responses with empty result arrays", async () => {
    getAllHeadquartersMock.mockResolvedValueOnce([
      {
        headquarters_id: "hq-empty-geocode",
        name: "Sede Empty",
        status: "active",
        address: "Calle Sin Resultado",
        city: "Cali",
        image_url: null,
      },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => [],
    });
    (globalThis as unknown as { fetch: jest.Mock }).fetch =
      fetchMock as unknown as jest.Mock;

    const { result } = renderHook(() => useHeadquarters());
    result.current.mapRef.current = document.createElement("div");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  it("creates headquarter with image upload path", async () => {
    createHeadquarterMock.mockResolvedValueOnce({
      headquarters_id: "hq-img-new",
      name: "Sede Imagen",
    });

    const { result } = renderHook(() => useHeadquarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openCreate();
      result.current.setForm({
        name: "Sede Imagen",
        status: "active",
        address: "Av Imagen",
        city: "Cali",
        image_url: null,
      });
      result.current.setImageFile(
        new File(["img"], "hq-new.png", { type: "image/png" }),
      );
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(uploadImageHeadquarterMock).toHaveBeenCalledWith(
      "hq-img-new",
      expect.objectContaining({ name: "hq-new.png" }),
    );
    expect(updateHeadquarterMock).toHaveBeenCalledWith("hq-img-new", {
      image_url: "https://cdn.test/hq.png",
    });
  });
});
