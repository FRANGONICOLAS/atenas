import { act, renderHook } from "@testing-library/react";
import { useToast } from "@/hooks/use-toast";

describe("useToast hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates, updates and dismisses a toast", () => {
    const { result } = renderHook(() => useToast());

    let controls: ReturnType<typeof result.current.toast> | null = null;

    act(() => {
      controls = result.current.toast({ title: "Initial" });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Initial");
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      controls?.update({ title: "Updated" } as never);
    });

    expect(result.current.toasts[0].title).toBe("Updated");

    act(() => {
      controls?.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("registers and cleans up listener on unmount", () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Listener test" });
    });

    expect(result.current.toasts).toHaveLength(1);

    // Ensure cleanup path runs without crashing.
    expect(() => unmount()).not.toThrow();
  });
});
