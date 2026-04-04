import { renderHook, waitFor, act } from "@testing-library/react";
import { useDonations } from "@/hooks/useDonations";

const useAuthMock = jest.fn();
const getUserDonationStatsMock = jest.fn();

jest.mock("@/hooks/useAuth", () => ({
  useAuth: (...args: unknown[]) => useAuthMock(...args),
}));

jest.mock("@/api/services/donation.service", () => ({
  donationService: {
    getUserDonationStats: (...args: unknown[]) =>
      getUserDonationStatsMock(...args),
  },
}));

describe("useDonations integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("integrates initial fetch and manual refetch", async () => {
    useAuthMock.mockReturnValue({ user: { id: "user-2" } });

    getUserDonationStatsMock
      .mockResolvedValueOnce({
        totalDonated: 100,
        projectsSupported: 1,
        beneficiariesImpacted: 2,
        recentDonations: [],
        supportedProjects: [],
      })
      .mockResolvedValueOnce({
        totalDonated: 250,
        projectsSupported: 2,
        beneficiariesImpacted: 3,
        recentDonations: [],
        supportedProjects: [],
      });

    const { result } = renderHook(() => useDonations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.stats?.totalDonated).toBe(100);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(getUserDonationStatsMock).toHaveBeenCalledTimes(2);
    expect(result.current.stats?.totalDonated).toBe(250);
  });

  it("keeps loading false and reports fallback message for unknown errors", async () => {
    useAuthMock.mockReturnValue({ user: { id: "user-3" } });
    getUserDonationStatsMock.mockRejectedValueOnce("unexpected");

    const { result } = renderHook(() => useDonations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Error al cargar las estadísticas");
  });
});
