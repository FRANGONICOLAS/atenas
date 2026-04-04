import { authService } from "@/api/services/auth.service";
import { supabaseError, supabaseOk } from "@/test/mocks/supabase.mock";

jest.mock("@/api/supabase/client", () => ({
  client: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    auth: {
      getSession: jest.Mock;
      getUser: jest.Mock;
      signUp: jest.Mock;
      signInWithPassword: jest.Mock;
      signInWithOAuth: jest.Mock;
      signOut: jest.Mock;
      updateUser: jest.Mock;
      resetPasswordForEmail: jest.Mock;
      onAuthStateChange: jest.Mock;
    };
  };
};

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns session when sign in succeeds", async () => {
    clientMock.auth.signInWithPassword.mockResolvedValueOnce(
      supabaseOk({
        user: { id: "user-1" },
        session: { access_token: "token" },
      }),
    );

    const result = await authService.signIn("demo@test.com", "123456");

    expect(clientMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "demo@test.com",
      password: "123456",
    });
    expect(result.session).toEqual({ access_token: "token" });
  });

  it("throws when sign in fails", async () => {
    clientMock.auth.signInWithPassword.mockResolvedValueOnce(
      supabaseError("Invalid credentials"),
    );

    await expect(
      authService.signIn("demo@test.com", "wrong"),
    ).rejects.toMatchObject({
      message: "Invalid credentials",
    });
  });

  it("returns current session", async () => {
    clientMock.auth.getSession.mockResolvedValueOnce(
      supabaseOk({ session: { access_token: "session-token" } }),
    );

    const session = await authService.getSession();

    expect(session).toEqual({ access_token: "session-token" });
  });

  it("throws when getSession fails", async () => {
    clientMock.auth.getSession.mockResolvedValueOnce(
      supabaseError("Session unavailable"),
    );

    await expect(authService.getSession()).rejects.toMatchObject({
      message: "Session unavailable",
    });
  });

  it("returns current user", async () => {
    clientMock.auth.getUser.mockResolvedValueOnce(
      supabaseOk({ user: { id: "user-2" } }),
    );

    const user = await authService.getCurrentUser();

    expect(user).toEqual({ id: "user-2" });
  });

  it("throws when getCurrentUser fails", async () => {
    clientMock.auth.getUser.mockResolvedValueOnce(
      supabaseError("Unauthorized", "401"),
    );

    await expect(authService.getCurrentUser()).rejects.toMatchObject({
      message: "Unauthorized",
      code: "401",
    });
  });

  it("signs up with metadata", async () => {
    clientMock.auth.signUp.mockResolvedValueOnce(
      supabaseOk({ user: { id: "new-user" }, session: null }),
    );

    const result = await authService.signUp("new@test.com", "123456", {
      role: "donator",
    });

    expect(clientMock.auth.signUp).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "123456",
      options: {
        data: { role: "donator" },
      },
    });
    expect(result.user).toEqual({ id: "new-user" });
  });

  it("throws when signUp fails", async () => {
    clientMock.auth.signUp.mockResolvedValueOnce(
      supabaseError("Email already registered"),
    );

    await expect(
      authService.signUp("new@test.com", "123456"),
    ).rejects.toMatchObject({
      message: "Email already registered",
    });
  });

  it("signs in with provider", async () => {
    clientMock.auth.signInWithOAuth.mockResolvedValueOnce({ error: null });

    await expect(authService.signInWithProvider()).resolves.toBeUndefined();
    expect(clientMock.auth.signInWithOAuth).toHaveBeenCalled();
  });

  it("throws when provider login fails", async () => {
    clientMock.auth.signInWithOAuth.mockResolvedValueOnce({
      error: { message: "Provider down" },
    });

    await expect(authService.signInWithProvider()).rejects.toMatchObject({
      message: "Provider down",
    });
  });

  it("updates authenticated user", async () => {
    clientMock.auth.updateUser.mockResolvedValueOnce(
      supabaseOk({ user: { id: "user-3" } }),
    );

    const result = await authService.updateUser({
      email: "updated@test.com",
      data: { first_name: "Updated" },
    });

    expect(result.user).toEqual({ id: "user-3" });
  });

  it("throws when updateUser fails", async () => {
    clientMock.auth.updateUser.mockResolvedValueOnce(
      supabaseError("Update rejected"),
    );

    await expect(
      authService.updateUser({ email: "updated@test.com" }),
    ).rejects.toMatchObject({
      message: "Update rejected",
    });
  });

  it("sends password reset email", async () => {
    clientMock.auth.resetPasswordForEmail.mockResolvedValueOnce(supabaseOk({}));

    await expect(
      authService.resetPasswordForEmail("reset@test.com"),
    ).resolves.toEqual({});
  });

  it("throws when reset password fails", async () => {
    clientMock.auth.resetPasswordForEmail.mockResolvedValueOnce(
      supabaseError("Reset blocked"),
    );

    await expect(
      authService.resetPasswordForEmail("reset@test.com"),
    ).rejects.toMatchObject({
      message: "Reset blocked",
    });
  });

  it("propagates sign out error", async () => {
    clientMock.auth.signOut.mockResolvedValueOnce({
      error: supabaseError("Session already closed").error,
    });

    await expect(authService.signOut()).rejects.toMatchObject({
      message: "Session already closed",
    });
  });

  it("returns auth state change subscription", () => {
    const subscription = {
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    };

    clientMock.auth.onAuthStateChange.mockReturnValueOnce(subscription);

    const result = authService.onAuthStateChange(jest.fn());

    expect(result).toBe(subscription);
  });
});
