import { donationService } from "@/api/services/donation.service";
import { supabaseOk } from "@/test/mocks/supabase.mock";

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
};

function createBuilder(): QueryBuilder {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    order: jest.fn(),
  } as unknown as QueryBuilder;

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return builder;
}

const { client: clientMock } = jest.requireMock("@/api/supabase/client") as {
  client: {
    from: jest.Mock;
  };
};

describe("donationService integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("integrates donation stats with project totals and beneficiaries", async () => {
    const userDonations = [
      {
        donation_id: "d-1",
        user_id: "u-1",
        project_id: "p-1",
        amount: "400",
        status: "approved",
        date: "2026-01-03",
        pay_method: "bold",
        approve_code: "A1",
        currency: "COP",
        created_at: "2026-01-03",
        project: {
          project_id: "p-1",
          name: "Proyecto Uno",
          category: "Educacion",
          finance_goal: "1000",
        },
      },
      {
        donation_id: "d-2",
        user_id: "u-1",
        project_id: "p-2",
        amount: "300",
        status: "approved",
        date: "2026-01-01",
        pay_method: "bold",
        approve_code: "A2",
        currency: "COP",
        created_at: "2026-01-01",
        project: {
          project_id: "p-2",
          name: "Proyecto Dos",
          category: "Salud",
          finance_goal: "500",
        },
      },
      {
        donation_id: "d-3",
        user_id: "u-1",
        project_id: "p-1",
        amount: "100",
        status: "pending",
        date: "2026-01-04",
        pay_method: "bold",
        approve_code: "A3",
        currency: "COP",
        created_at: "2026-01-04",
      },
    ];

    const listBuilder = createBuilder();
    listBuilder.order.mockResolvedValueOnce(supabaseOk(userDonations));

    const totalsBuilder = createBuilder();
    let currentProjectId = "";
    totalsBuilder.eq.mockImplementation((column: string, value: string) => {
      if (column === "project_id") {
        currentProjectId = value;
        return totalsBuilder;
      }

      if (column === "status") {
        const totalsByProject: Record<string, Array<{ amount: string }>> = {
          "p-1": [{ amount: "700" }],
          "p-2": [{ amount: "500" }],
        };

        return Promise.resolve(
          supabaseOk(totalsByProject[currentProjectId] || []),
        );
      }

      return totalsBuilder;
    });

    const hqBuilder = createBuilder();
    hqBuilder.in.mockResolvedValueOnce(
      supabaseOk([{ headquarters_id: "hq-1" }, { headquarters_id: "hq-2" }]),
    );

    const beneficiariesBuilder = createBuilder();
    beneficiariesBuilder.in.mockResolvedValueOnce(
      supabaseOk([
        { beneficiary_id: "b-1" },
        { beneficiary_id: "b-2" },
        { beneficiary_id: "b-2" },
      ]),
    );

    clientMock.from
      .mockImplementationOnce(() => listBuilder)
      .mockImplementationOnce(() => totalsBuilder)
      .mockImplementationOnce(() => totalsBuilder)
      .mockImplementationOnce(() => hqBuilder)
      .mockImplementationOnce(() => beneficiariesBuilder);

    const stats = await donationService.getUserDonationStats("u-1");

    expect(stats.totalDonated).toBe(700);
    expect(stats.projectsSupported).toBe(2);
    expect(stats.beneficiariesImpacted).toBe(2);
    expect(stats.recentDonations).toHaveLength(2);
    expect(stats.supportedProjects).toHaveLength(2);
    expect(stats.supportedProjects[0]).toMatchObject({
      project_id: "p-1",
      project_name: "Proyecto Uno",
      totalDonated: 400,
      progress: 70,
    });
    expect(stats.supportedProjects[1]).toMatchObject({
      project_id: "p-2",
      project_name: "Proyecto Dos",
      totalDonated: 300,
      progress: 100,
    });
  });
});
