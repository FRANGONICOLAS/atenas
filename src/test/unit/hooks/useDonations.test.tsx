import { renderHook, waitFor } from "@testing-library/react";
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

describe("useDonations unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps empty state when user is not authenticated", async () => {
    useAuthMock.mockReturnValue({ user: null });

    const { result } = renderHook(() => useDonations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
    expect(getUserDonationStatsMock).not.toHaveBeenCalled();
  });

  it("loads donation stats for authenticated user", async () => {
    useAuthMock.mockReturnValue({ user: { id: "user-1" } });
    getUserDonationStatsMock.mockResolvedValueOnce({
      totalDonated: 500,
      projectsSupported: 2,
      beneficiariesImpacted: 4,
      recentDonations: [],
      supportedProjects: [],
    });

    const { result } = renderHook(() => useDonations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getUserDonationStatsMock).toHaveBeenCalledWith("user-1");
    expect(result.current.stats?.totalDonated).toBe(500);
    expect(result.current.error).toBeNull();
  });

  it("returns controlled error state when service fails", async () => {
    useAuthMock.mockReturnValue({ user: { id: "user-1" } });
    getUserDonationStatsMock.mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useDonations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe("Timeout");
  });
});
