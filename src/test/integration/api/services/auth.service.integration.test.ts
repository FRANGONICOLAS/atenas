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
      signUp: jest.Mock;
      getSession: jest.Mock;
      signOut: jest.Mock;
      signInWithPassword: jest.Mock;
    };
  };
};

describe("authService integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("integrates signUp and session retrieval flow", async () => {
    clientMock.auth.signUp.mockResolvedValueOnce(
      supabaseOk({
        user: { id: "new-user" },
        session: { access_token: "token" },
      }),
    );
    clientMock.auth.getSession.mockResolvedValueOnce(
      supabaseOk({ session: { access_token: "token" } }),
    );

    const signUpResult = await authService.signUp("new@test.com", "123456");
    const session = await authService.getSession();

    expect(clientMock.auth.signUp).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "123456",
      options: {
        data: undefined,
      },
    });
    expect(signUpResult.user).toEqual({ id: "new-user" });
    expect(session).toEqual({ access_token: "token" });
  });

  it("propagates signOut errors from Supabase", async () => {
    clientMock.auth.signOut.mockResolvedValueOnce({
      error: supabaseError("Session already closed").error,
    });

    await expect(authService.signOut()).rejects.toMatchObject({
      message: "Session already closed",
    });
  });

  it("propagates forbidden auth responses (403) from Supabase", async () => {
    clientMock.auth.signInWithPassword.mockResolvedValueOnce(
      supabaseError("Forbidden", "403"),
    );

    await expect(
      authService.signIn("blocked@test.com", "123456"),
    ).rejects.toMatchObject({
      message: "Forbidden",
      code: "403",
    });
  });

  it("propagates network timeout failures from Supabase auth", async () => {
    clientMock.auth.signInWithPassword.mockRejectedValueOnce(
      new Error("Network timeout"),
    );

    await expect(
      authService.signIn("timeout@test.com", "123456"),
    ).rejects.toMatchObject({
      message: "Network timeout",
    });
  });
});
