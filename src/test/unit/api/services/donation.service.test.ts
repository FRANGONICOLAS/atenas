import { donationService } from "@/api/services/donation.service";
import { supabaseError, supabaseOk } from "@/test/mocks/supabase.mock";

jest.mock("@/api/supabase/client", () => ({
  client: {
    from: jest.fn(),
  },
}));

type QueryBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  order: jest.Mock;
  single: jest.Mock;
};

function createBuilder(): QueryBuilder {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("donationService unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns ordered user donations", async () => {
    const donations = [
      {
        donation_id: "d-1",
        user_id: "u-1",
        project_id: "p-1",
        amount: "100",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A1",
        currency: "COP",
        created_at: "2026-01-01",
      },
    ];

    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(supabaseOk(donations));
    clientMock.from.mockReturnValueOnce(builder);

    const result = await donationService.getUserDonations("u-1");

    expect(clientMock.from).toHaveBeenCalledWith("donation");
    expect(builder.select).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u-1");
    expect(builder.order).toHaveBeenCalledWith("date", { ascending: false });
    expect(result).toEqual(donations);
  });

  it("returns empty list when getUserDonations has null data", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce({ data: null, error: null });
    clientMock.from.mockReturnValueOnce(builder);

    const result = await donationService.getUserDonations("u-1");

    expect(result).toEqual([]);
  });

  it("throws when getUserDonations query fails", async () => {
    const builder = createBuilder();
    builder.order.mockResolvedValueOnce(supabaseError("DB unavailable"));
    clientMock.from.mockReturnValueOnce(builder);

    await expect(donationService.getUserDonations("u-1")).rejects.toMatchObject(
      {
        message: "DB unavailable",
      },
    );
  });

  it("calculates donation stats for approved donations", async () => {
    const donations = [
      {
        donation_id: "d-1",
        user_id: "u-1",
        project_id: "p-1",
        amount: "100",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A1",
        currency: "COP",
        created_at: "2026-01-01",
        project: {
          project_id: "p-1",
          name: "Proyecto Agua",
          category: "Infraestructura",
          finance_goal: "1000",
        },
      },
      {
        donation_id: "d-2",
        user_id: "u-1",
        project_id: "p-1",
        amount: "50",
        status: "pending",
        date: "2026-01-02",
        pay_method: "bold",
        approve_code: "A2",
        currency: "COP",
        created_at: "2026-01-02",
      },
      {
        donation_id: "d-3",
        user_id: "u-1",
        project_id: "p-2",
        amount: "200",
        status: "approved",
        date: "2026-01-03",
        pay_method: "bold",
        approve_code: "A3",
        currency: "COP",
        created_at: "2026-01-03",
        project: {
          project_id: "p-2",
          name: "Proyecto Educacion",
          category: "Educacion",
          finance_goal: "400",
        },
      },
    ];

    jest
      .spyOn(donationService, "getUserDonations")
      .mockResolvedValueOnce(donations as never);

    const donationBuilder = createBuilder();
    let currentProjectId = "";
    donationBuilder.eq.mockImplementation((column: string, value: string) => {
      if (column === "project_id") {
        currentProjectId = value;
        return donationBuilder;
      }

      if (column === "status") {
        const totalsByProject: Record<string, Array<{ amount: string }>> = {
          "p-1": [{ amount: "150" }],
          "p-2": [{ amount: "200" }],
        };

        return Promise.resolve(
          supabaseOk(totalsByProject[currentProjectId] || []),
        );
      }

      return donationBuilder;
    });

    const hqBuilder = createBuilder();
    hqBuilder.in.mockResolvedValueOnce(
      supabaseOk([{ headquarters_id: "hq-1" }, { headquarters_id: "hq-1" }]),
    );

    const beneficiaryBuilder = createBuilder();
    beneficiaryBuilder.in.mockResolvedValueOnce(
      supabaseOk([{ beneficiary_id: "b-1" }, { beneficiary_id: "b-2" }]),
    );

    clientMock.from
      .mockImplementationOnce(() => donationBuilder)
      .mockImplementationOnce(() => donationBuilder)
      .mockImplementationOnce(() => hqBuilder)
      .mockImplementationOnce(() => beneficiaryBuilder);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.totalDonated).toBe(300);
    expect(stats.projectsSupported).toBe(2);
    expect(stats.beneficiariesImpacted).toBe(2);
    expect(stats.recentDonations).toHaveLength(2);
    expect(stats.supportedProjects[0].project_id).toBe("p-2");
    expect(stats.supportedProjects[0].progress).toBe(50);
  });

  it("returns zero beneficiaries impacted when no related headquarters exist", async () => {
    jest.spyOn(donationService, "getUserDonations").mockResolvedValueOnce([
      {
        donation_id: "d-1",
        user_id: "u-1",
        project_id: "p-1",
        amount: "100",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A1",
        currency: "COP",
        created_at: "2026-01-01",
        project: {
          project_id: "p-1",
          name: "Proyecto Agua",
          category: "Infraestructura",
          finance_goal: "1000",
        },
      },
    ] as never);

    const totalsBuilder = createBuilder();
    totalsBuilder.eq.mockImplementation((column: string) => {
      if (column === "project_id") return totalsBuilder;
      return Promise.resolve(supabaseOk([{ amount: "100" }]));
    });

    const hqBuilder = createBuilder();
    hqBuilder.in.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from
      .mockImplementationOnce(() => totalsBuilder)
      .mockImplementationOnce(() => hqBuilder);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.beneficiariesImpacted).toBe(0);
  });

  it("returns zeroed stats when there are no approved donations", async () => {
    jest.spyOn(donationService, "getUserDonations").mockResolvedValueOnce([
      {
        donation_id: "d-2",
        user_id: "u-1",
        project_id: "p-1",
        amount: "50",
        status: "pending",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A2",
        currency: "COP",
        created_at: "2026-01-01",
      },
    ] as never);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.totalDonated).toBe(0);
    expect(stats.projectsSupported).toBe(0);
    expect(stats.supportedProjects).toEqual([]);
  });

  it("ignores approved donations without project_id when computing projects", async () => {
    jest.spyOn(donationService, "getUserDonations").mockResolvedValueOnce([
      {
        donation_id: "d-9",
        user_id: "u-1",
        project_id: null,
        amount: "300",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A9",
        currency: "COP",
        created_at: "2026-01-01",
      },
    ] as never);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.totalDonated).toBe(300);
    expect(stats.projectsSupported).toBe(0);
    expect(stats.supportedProjects).toEqual([]);
  });

  it("handles project goal as number when calculating progress", async () => {
    jest.spyOn(donationService, "getUserDonations").mockResolvedValueOnce([
      {
        donation_id: "d-10",
        user_id: "u-1",
        project_id: "p-10",
        amount: "200",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A10",
        currency: "COP",
        created_at: "2026-01-01",
        project: {
          project_id: "p-10",
          name: "Proyecto Num",
          category: "Social",
          finance_goal: 500,
        },
      },
    ] as never);

    const totalsBuilder = createBuilder();
    totalsBuilder.eq.mockImplementation((column: string) => {
      if (column === "project_id") return totalsBuilder;
      return Promise.resolve(supabaseOk([{ amount: "300" }]));
    });

    const hqBuilder = createBuilder();
    hqBuilder.in.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from
      .mockImplementationOnce(() => totalsBuilder)
      .mockImplementationOnce(() => hqBuilder);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.supportedProjects[0].progress).toBe(60);
  });

  it("uses fallback project metadata and financeGoal=1 when project is missing", async () => {
    jest.spyOn(donationService, "getUserDonations").mockResolvedValueOnce([
      {
        donation_id: "d-11",
        user_id: "u-1",
        project_id: "p-11",
        amount: "10",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A11",
        currency: "COP",
        created_at: "2026-01-01",
        project: undefined,
      },
    ] as never);

    const totalsBuilder = createBuilder();
    totalsBuilder.eq.mockImplementation((column: string) => {
      if (column === "project_id") return totalsBuilder;
      return Promise.resolve(supabaseOk([]));
    });

    const hqBuilder = createBuilder();
    hqBuilder.in.mockResolvedValueOnce(supabaseOk([]));

    clientMock.from
      .mockImplementationOnce(() => totalsBuilder)
      .mockImplementationOnce(() => hqBuilder);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.supportedProjects[0]).toMatchObject({
      project_name: "Proyecto",
      category: "General",
      finance_goal: 1,
      progress: 0,
    });
  });

  it("handles null headquarters query result", async () => {
    jest.spyOn(donationService, "getUserDonations").mockResolvedValueOnce([
      {
        donation_id: "d-12",
        user_id: "u-1",
        project_id: "p-12",
        amount: "30",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A12",
        currency: "COP",
        created_at: "2026-01-01",
        project: {
          project_id: "p-12",
          name: "P12",
          category: "Social",
          finance_goal: "100",
        },
      },
    ] as never);

    const totalsBuilder = createBuilder();
    totalsBuilder.eq.mockImplementation((column: string) => {
      if (column === "project_id") return totalsBuilder;
      return Promise.resolve(supabaseOk([{ amount: "30" }]));
    });

    const hqBuilder = createBuilder();
    hqBuilder.in.mockResolvedValueOnce({ data: null, error: null });

    clientMock.from
      .mockImplementationOnce(() => totalsBuilder)
      .mockImplementationOnce(() => hqBuilder);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.beneficiariesImpacted).toBe(0);
  });

  it("returns donation by id", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(
      supabaseOk({ donation_id: "d-10", status: "approved" }),
    );

    clientMock.from.mockReturnValueOnce(builder);

    const result = await donationService.getDonationById("d-10");

    expect(builder.eq).toHaveBeenCalledWith("donation_id", "d-10");
    expect(result).toEqual({ donation_id: "d-10", status: "approved" });
  });

  it("throws when getDonationById fails", async () => {
    const builder = createBuilder();
    builder.single.mockResolvedValueOnce(supabaseError("Not found", "404"));

    clientMock.from.mockReturnValueOnce(builder);

    await expect(
      donationService.getDonationById("missing"),
    ).rejects.toMatchObject({
      message: "Not found",
      code: "404",
    });
  });
});
