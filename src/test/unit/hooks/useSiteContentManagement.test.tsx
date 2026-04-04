import { act, renderHook, waitFor } from "@testing-library/react";
import { useSiteContentManagement } from "@/hooks/useSiteContentManagement";

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
const toastInfoMock = jest.fn();

const getAllContentsMock = jest.fn();
const getStatsMock = jest.fn();
const createContentMock = jest.fn();
const updateContentFileMock = jest.fn();
const deleteContentMock = jest.fn();
const toggleActiveMock = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
    info: (...args: unknown[]) => toastInfoMock(...args),
  },
}));

jest.mock("@/api/services", () => ({
  contentService: {
    getAllContents: (...args: unknown[]) => getAllContentsMock(...args),
    getStats: (...args: unknown[]) => getStatsMock(...args),
    createContent: (...args: unknown[]) => createContentMock(...args),
    updateContentFile: (...args: unknown[]) => updateContentFileMock(...args),
    deleteContent: (...args: unknown[]) => deleteContentMock(...args),
    toggleActive: (...args: unknown[]) => toggleActiveMock(...args),
  },
}));

describe("useSiteContentManagement unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getAllContentsMock.mockResolvedValue([
      {
        content_id: "c-1",
        content_key: "home_hero",
        title: "Hero",
        page_section: "home",
        content_type: "image",
        category: "hero",
        is_active: true,
        public_url: "https://cdn.test/hero.png",
      },
    ]);

    getStatsMock.mockResolvedValue({
      total: 1,
      active: 1,
      photos: 1,
      videos: 0,
      by_section: { home: 1 },
    });

    createContentMock.mockResolvedValue({ content_id: "c-created" });
    updateContentFileMock.mockResolvedValue({ content_id: "c-updated" });
    deleteContentMock.mockResolvedValue(undefined);
    toggleActiveMock.mockResolvedValue({ content_id: "c-1" });
  });

  it("loads contents and stats on mount", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getAllContentsMock).toHaveBeenCalled();
    expect(getStatsMock).toHaveBeenCalled();
    expect(result.current.contents).toHaveLength(1);
    expect(result.current.stats.total).toBe(1);
  });

  it("shows toast when loadContents fails", async () => {
    getAllContentsMock.mockRejectedValueOnce(new Error("load failed"));

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al cargar contenidos", {
      description: "load failed",
    });
  });

  it("uses generic description when loadContents throws non-Error", async () => {
    getAllContentsMock.mockRejectedValueOnce("boom");

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al cargar contenidos", {
      description: "Error desconocido",
    });
  });

  it("handles loadStats error without breaking mount", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    getStatsMock.mockRejectedValueOnce(new Error("stats failed"));

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.current.stats.total).toBe(0);

    consoleErrorSpy.mockRestore();
  });

  it("opens create dialog with active tab preselected", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setActivePageTab("about");
    });

    act(() => {
      result.current.handleOpenCreate();
    });

    expect(result.current.showDialog).toBe(true);
    expect(result.current.isCreating).toBe(true);
    expect(result.current.editingContent).toBeNull();
    expect(result.current.formData.page_section).toBe("about");
  });

  it("falls back to home page_section when active tab is empty", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setActivePageTab("");
    });

    act(() => {
      result.current.handleOpenCreate();
    });

    expect(result.current.formData.page_section).toBe("home");
  });

  it("opens edit dialog with existing content preview", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const content = result.current.contents[0];

    act(() => {
      result.current.handleOpenEdit(content);
    });

    expect(result.current.showDialog).toBe(true);
    expect(result.current.isCreating).toBe(false);
    expect(result.current.editingContent?.content_id).toBe("c-1");
    expect(result.current.previewUrl).toBe("https://cdn.test/hero.png");
  });

  it("updates file and preview via handleImageChange", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const file = new File(["img"], "preview.png", { type: "image/png" });

    act(() => {
      result.current.handleImageChange(file, "blob:preview");
    });

    expect(result.current.file).toBe(file);
    expect(result.current.previewUrl).toBe("blob:preview");
  });

  it("validates create flow when file is missing", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setIsCreating(true);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createContentMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith("Debes seleccionar una imagen");
  });

  it("validates create flow when required fields are missing", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setIsCreating(true);
      result.current.setFile(
        new File(["img"], "only-file.png", { type: "image/png" }),
      );
      result.current.setFormData((prev) => ({
        ...prev,
        title: "",
      }));
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createContentMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Completa todos los campos requeridos",
    );
  });

  it("creates content and refreshes lists", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1710000002000);

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const file = new File(["img"], "hero image.png", { type: "image/png" });

    act(() => {
      result.current.setIsCreating(true);
      result.current.setFormData((prev) => ({
        ...prev,
        title: "Hero Principal",
        description: "Desc",
        page_section: "home",
        content_type: "image",
        category: "",
      }));
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createContentMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Contenido creado correctamente",
    );
    expect(getAllContentsMock).toHaveBeenCalledTimes(2);
    expect(getStatsMock).toHaveBeenCalledTimes(2);

    (Date.now as jest.Mock).mockRestore();
  });

  it("uses preset content_key and category in create flow", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const file = new File(["img"], "hero-fixed.png", { type: "image/png" });

    act(() => {
      result.current.setIsCreating(true);
      result.current.setFile(file);
      result.current.setFormData((prev) => ({
        ...prev,
        content_key: "home_hero_fixed",
        title: "Hero Fixed",
        page_section: "home",
        category: "manual-cat",
      }));
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content_key: "home_hero_fixed",
        category: "manual-cat",
      }),
    );
  });

  it("shows create error toast when createContent fails", async () => {
    createContentMock.mockRejectedValueOnce(new Error("create failed"));

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setIsCreating(true);
      result.current.setFile(
        new File(["img"], "hero.png", { type: "image/png" }),
      );
      result.current.setFormData((prev) => ({
        ...prev,
        title: "Hero",
        page_section: "home",
      }));
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al crear", {
      description: "create failed",
    });
  });

  it("uses generic description when create/update errors are non-Error", async () => {
    createContentMock.mockRejectedValueOnce("broken");

    const createHook = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(createHook.result.current.loading).toBe(false);
    });

    act(() => {
      createHook.result.current.setIsCreating(true);
      createHook.result.current.setFile(
        new File(["img"], "hero.png", { type: "image/png" }),
      );
      createHook.result.current.setFormData((prev) => ({
        ...prev,
        title: "Hero",
        page_section: "home",
      }));
    });

    await act(async () => {
      await createHook.result.current.handleSubmit();
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al crear", {
      description: "Error desconocido",
    });

    updateContentFileMock.mockRejectedValueOnce("broken-update");

    const updateHook = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(updateHook.result.current.loading).toBe(false);
    });

    act(() => {
      updateHook.result.current.handleOpenEdit(
        updateHook.result.current.contents[0],
      );
      updateHook.result.current.setFile(
        new File(["img"], "new.png", { type: "image/png" }),
      );
    });

    await act(async () => {
      await updateHook.result.current.handleSubmit();
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al actualizar", {
      description: "Error desconocido",
    });
  });

  it("updates file in edit flow when a new file is selected", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleOpenEdit(result.current.contents[0]);
      result.current.setFile(
        new File(["img"], "new.png", { type: "image/png" }),
      );
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(updateContentFileMock).toHaveBeenCalledWith(
      "home_hero",
      expect.any(File),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Imagen actualizada correctamente",
    );
  });

  it("shows info when edit flow has no new file", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleOpenEdit(result.current.contents[0]);
      result.current.setFile(null);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(updateContentFileMock).not.toHaveBeenCalled();
    expect(toastInfoMock).toHaveBeenCalledWith(
      "No se seleccionó ninguna imagen nueva",
    );
  });

  it("shows update error toast when updating file fails", async () => {
    updateContentFileMock.mockRejectedValueOnce(new Error("update failed"));

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleOpenEdit(result.current.contents[0]);
      result.current.setFile(
        new File(["img"], "new.png", { type: "image/png" }),
      );
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al actualizar", {
      description: "update failed",
    });
  });

  it("deletes content and clears delete target", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setDeleteTarget(result.current.contents[0]);
    });

    await act(async () => {
      await result.current.handleDelete("c-1");
    });

    expect(deleteContentMock).toHaveBeenCalledWith("c-1");
    expect(result.current.deleteTarget).toBeNull();
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Contenido eliminado correctamente",
    );
  });

  it("shows delete error toast", async () => {
    deleteContentMock.mockRejectedValueOnce(new Error("delete failed"));

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("c-1");
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al eliminar", {
      description: "delete failed",
    });
  });

  it("uses generic descriptions for delete/toggle non-Error failures", async () => {
    deleteContentMock.mockRejectedValueOnce("delete boom");
    toggleActiveMock.mockRejectedValueOnce("toggle boom");

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("c-1");
    });

    await act(async () => {
      await result.current.handleToggleActive(result.current.contents[0]);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al eliminar", {
      description: "Error desconocido",
    });
    expect(toastErrorMock).toHaveBeenCalledWith("Error al cambiar estado", {
      description: "Error desconocido",
    });
  });

  it("toggles active state and resolves labels", async () => {
    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleToggleActive(result.current.contents[0]);
    });

    expect(toggleActiveMock).toHaveBeenCalledWith("c-1", false);
    expect(toastSuccessMock).toHaveBeenCalledWith("Contenido desactivado");
    expect(result.current.getPageSectionLabel("home")).toBe("Inicio");
    expect(result.current.getPageSectionLabel("custom")).toBe("custom");
  });

  it("shows toggle error toast", async () => {
    toggleActiveMock.mockRejectedValueOnce(new Error("toggle failed"));

    const { result } = renderHook(() => useSiteContentManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleToggleActive(result.current.contents[0]);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Error al cambiar estado", {
      description: "toggle failed",
    });
  });
});
