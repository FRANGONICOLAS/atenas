import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";

const getSessionMock = jest.fn();
const onAuthStateChangeMock = jest.fn();
const signOutMock = jest.fn();
const getByIdMock = jest.fn();
const getUserRolesMock = jest.fn();

jest.mock("@/api/services/auth.service", () => ({
  authService: {
    getSession: (...args: unknown[]) => getSessionMock(...args),
    onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
    signOut: (...args: unknown[]) => signOutMock(...args),
  },
}));

jest.mock("@/api/services/user.service", () => ({
  userService: {
    getById: (...args: unknown[]) => getByIdMock(...args),
    getUserRoles: (...args: unknown[]) => getUserRolesMock(...args),
  },
}));

describe("useAuth integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
  });

  it("restores session and enriches user roles", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-1",
        email: "user@test.com",
        user_metadata: {},
      },
    });
    getByIdMock.mockResolvedValueOnce({
      username: "user",
      first_name: "Test",
      last_name: "User",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce(["admin"]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user?.role).toBe("admin");
    expect(result.current.user?.hasCompletedProfile).toBe(true);
  });

  it("clears user when auth state changes to SIGNED_OUT", async () => {
    let authCallback: ((event: string, session: unknown) => void) | undefined;

    onAuthStateChangeMock.mockImplementationOnce(
      (callback: typeof authCallback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      },
    );

    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-2",
        email: "user2@test.com",
        user_metadata: {},
      },
    });
    getByIdMock.mockResolvedValueOnce({
      username: "user2",
      first_name: "Test",
      last_name: "Two",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce(["director"]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      authCallback?.("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it("falls back to unauthenticated state when getSession fails", async () => {
    getSessionMock.mockRejectedValueOnce(new Error("Service unavailable"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it("uses metadata role when DB has no roles", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-3",
        email: "meta@test.com",
        user_metadata: { role: "director" },
      },
    });
    getByIdMock.mockResolvedValueOnce({
      username: "meta-user",
      first_name: "Meta",
      last_name: "User",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user?.role).toBe("director");
    expect(result.current.user?.roles).toEqual(["director"]);
  });

  it("falls back to default donator when metadata role is not a string", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-3b",
        email: "meta2@test.com",
        user_metadata: { role: 123 },
      },
    });
    getByIdMock.mockResolvedValueOnce({
      username: "meta2",
      first_name: "Meta",
      last_name: "Two",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user?.role).toBe("donator");
    expect(result.current.user?.roles).toEqual(["donator"]);
  });

  it("marks profile as incomplete when db user misses required fields", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-incomplete",
        email: "incomplete@test.com",
        user_metadata: {},
      },
    });
    getByIdMock.mockResolvedValueOnce({
      username: "incomplete",
      first_name: null,
      last_name: "User",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce(["director"]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user?.hasCompletedProfile).toBe(false);
  });

  it("falls back to donator role when enrichment fails", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-4",
        email: "fallback@test.com",
        user_metadata: {},
      },
    });
    getByIdMock.mockRejectedValueOnce(new Error("db error"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user?.role).toBe("donator");
    expect(result.current.user?.hasCompletedProfile).toBe(false);
  });

  it("handles TOKEN_REFRESHED event by re-enriching the user", async () => {
    let authCallback: ((event: string, session: unknown) => void) | undefined;

    onAuthStateChangeMock.mockImplementationOnce(
      (callback: typeof authCallback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      },
    );

    getSessionMock.mockResolvedValueOnce({ user: null });
    getByIdMock.mockResolvedValueOnce({
      username: "refresh",
      first_name: "Ref",
      last_name: "Reshed",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce(["admin"]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await authCallback?.("TOKEN_REFRESHED", {
        user: {
          id: "user-5",
          email: "refresh@test.com",
          user_metadata: {},
        },
      });
    });

    await waitFor(() => {
      expect(result.current.user?.role).toBe("admin");
    });
  });

  it("handles USER_UPDATED event", async () => {
    let authCallback: ((event: string, session: unknown) => void) | undefined;

    onAuthStateChangeMock.mockImplementationOnce(
      (callback: typeof authCallback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      },
    );

    getSessionMock.mockResolvedValueOnce({ user: null });
    getByIdMock.mockResolvedValueOnce({
      username: "updated-user",
      first_name: "Updated",
      last_name: "User",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce(["director"]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await authCallback?.("USER_UPDATED", {
        user: {
          id: "user-7",
          email: "updated@test.com",
          user_metadata: {},
        },
      });
    });

    await waitFor(() => {
      expect(result.current.user?.role).toBe("director");
    });
  });

  it("refreshUser enriches current session user", async () => {
    getSessionMock
      .mockResolvedValueOnce({
        user: {
          id: "user-8",
          email: "init@test.com",
          user_metadata: {},
        },
      })
      .mockResolvedValueOnce({
        user: {
          id: "user-8",
          email: "refresh@test.com",
          user_metadata: {},
        },
      });

    getByIdMock
      .mockResolvedValueOnce({
        username: "init-user",
        first_name: "Init",
        last_name: "User",
        phone: null,
        headquarter_id: null,
      })
      .mockResolvedValueOnce({
        username: "refresh-user",
        first_name: "Refresh",
        last_name: "User",
        phone: null,
        headquarter_id: null,
      });

    getUserRolesMock.mockResolvedValue(["admin"]);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.username).toBe("refresh-user");
  });

  it("refreshUser does nothing when session has no user", async () => {
    getSessionMock.mockResolvedValueOnce({ user: null }).mockResolvedValueOnce({
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toBeNull();
  });

  it("signOut clears authenticated user", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-6",
        email: "signout@test.com",
        user_metadata: {},
      },
    });
    getByIdMock.mockResolvedValueOnce({
      username: "u6",
      first_name: "User",
      last_name: "Six",
      phone: null,
      headquarter_id: null,
    });
    getUserRolesMock.mockResolvedValueOnce(["donator"]);
    signOutMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("ignores auth events other than SIGNED_OUT, TOKEN_REFRESHED and USER_UPDATED", async () => {
    let authCallback: ((event: string, session: unknown) => void) | undefined;

    onAuthStateChangeMock.mockImplementationOnce(
      (callback: typeof authCallback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      },
    );

    getSessionMock.mockResolvedValueOnce({ user: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await authCallback?.("SIGNED_IN", {
        user: {
          id: "ignored",
          email: "ignored@test.com",
          user_metadata: {},
        },
      });
    });

    expect(result.current.user).toBeNull();
  });
});
