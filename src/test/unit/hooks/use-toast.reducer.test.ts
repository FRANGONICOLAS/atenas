import { reducer } from "@/hooks/use-toast";

describe("use-toast reducer", () => {
  it("keeps only the newest toast because TOAST_LIMIT is 1", () => {
    const initialState = { toasts: [] };

    const withFirst = reducer(initialState, {
      type: "ADD_TOAST",
      toast: {
        id: "1",
        open: true,
        title: "First",
      },
    });

    const withSecond = reducer(withFirst, {
      type: "ADD_TOAST",
      toast: {
        id: "2",
        open: true,
        title: "Second",
      },
    });

    expect(withSecond.toasts).toHaveLength(1);
    expect(withSecond.toasts[0].id).toBe("2");
  });

  it("updates toast values by id", () => {
    const state = {
      toasts: [
        {
          id: "1",
          open: true,
          title: "Initial",
        },
      ],
    };

    const result = reducer(state, {
      type: "UPDATE_TOAST",
      toast: {
        id: "1",
        title: "Updated",
      },
    });

    expect(result.toasts[0].title).toBe("Updated");
  });

  it("marks toast as closed on dismiss", () => {
    const state = {
      toasts: [
        {
          id: "1",
          open: true,
          title: "Dismiss me",
        },
      ],
    };

    const result = reducer(state, {
      type: "DISMISS_TOAST",
      toastId: "1",
    });

    expect(result.toasts[0].open).toBe(false);
  });

  it("dismisses all toasts when no id is provided", () => {
    const state = {
      toasts: [
        { id: "1", open: true, title: "First" },
        { id: "2", open: true, title: "Second" },
      ],
    };

    const result = reducer(state, {
      type: "DISMISS_TOAST",
    });

    expect(result.toasts[0].open).toBe(false);
    expect(result.toasts[1].open).toBe(false);
  });

  it("removes a toast by id", () => {
    const state = {
      toasts: [
        { id: "1", open: true, title: "First" },
        { id: "2", open: true, title: "Second" },
      ],
    };

    const result = reducer(state, {
      type: "REMOVE_TOAST",
      toastId: "1",
    });

    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe("2");
  });

  it("removes all toasts when toastId is undefined", () => {
    const state = {
      toasts: [
        { id: "1", open: true, title: "First" },
        { id: "2", open: true, title: "Second" },
      ],
    };

    const result = reducer(state, {
      type: "REMOVE_TOAST",
    });

    expect(result.toasts).toEqual([]);
  });
});
