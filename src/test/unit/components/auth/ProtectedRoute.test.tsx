import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderWithRoutes(element: React.ReactNode, initialPath = "/private") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>LoginPage</div>} />
        <Route path="/complete-profile" element={<div>CompleteProfile</div>} />
        <Route path="/private" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      hasRole: jest.fn(),
      hasAnyRole: jest.fn(),
      canAccessAdmin: jest.fn(),
      canAccessDirector: jest.fn(),
      canAccessDonator: jest.fn(),
    } as never);

    renderWithRoutes(
      <ProtectedRoute>
        <div>PrivateContent</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("shows access denied when user lacks allowed role", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        hasCompletedProfile: true,
        roles: ["donator"],
      },
      isLoading: false,
      isAuthenticated: true,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      hasRole: jest.fn(),
      hasAnyRole: jest.fn(),
      canAccessAdmin: jest.fn(),
      canAccessDirector: jest.fn(),
      canAccessDonator: jest.fn(),
    } as never);

    renderWithRoutes(
      <ProtectedRoute allowedRoles={["admin"]}>
        <div>PrivateContent</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Acceso Denegado")).toBeInTheDocument();
  });

  it("redirects to complete profile when profile is incomplete", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        hasCompletedProfile: false,
        roles: ["admin"],
      },
      isLoading: false,
      isAuthenticated: true,
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    } as never);

    renderWithRoutes(
      <ProtectedRoute>
        <div>PrivateContent</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("CompleteProfile")).toBeInTheDocument();
  });

  it("renders private content when role is allowed and profile is complete", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        hasCompletedProfile: true,
        roles: ["admin"],
      },
      isLoading: false,
      isAuthenticated: true,
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    } as never);

    renderWithRoutes(
      <ProtectedRoute allowedRoles={["admin"]}>
        <div>PrivateContent</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("PrivateContent")).toBeInTheDocument();
  });
});
