import { render, screen } from "@testing-library/react";
import {
  calculateAge,
  getAgeCategory,
  getPerformanceColor,
  getStatusBadge,
  mapToReport,
} from "@/lib";

describe("beneficiaryUtils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-04T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calculates age and age category correctly", () => {
    expect(calculateAge("2018-04-05")).toBe(7);
    expect(calculateAge("2018-04-04")).toBe(8);

    expect(getAgeCategory("2019-05-01")).toBe("Categoría 1");
    expect(getAgeCategory("2017-04-04")).toBe("Categoría 2");
    expect(getAgeCategory("2015-04-04")).toBe("Categoría 3");
    expect(getAgeCategory("2013-04-04")).toBe("Categoría 4");
    expect(getAgeCategory("2011-04-04")).toBe("Categoría 5");
  });

  it("returns expected performance color by score", () => {
    expect(getPerformanceColor(95)).toBe("text-green-600");
    expect(getPerformanceColor(80)).toBe("text-blue-600");
    expect(getPerformanceColor(65)).toBe("text-yellow-600");
    expect(getPerformanceColor(40)).toBe("text-red-600");
  });

  it("maps beneficiaries to report format", () => {
    const report = mapToReport([
      {
        beneficiary_id: "b-1",
        headquarters_id: "hq-1",
        first_name: "Ana",
        last_name: "Lopez",
        birth_date: "2016-04-04",
        category: "Categoría 2",
        phone: "123",
        registry_date: "2026-01-01",
        status: "activo",
        performance: 77,
      },
    ] as never);

    expect(report).toEqual([
      {
        beneficiary_id: "b-1",
        first_name: "Ana",
        last_name: "Lopez",
        age: 10,
        category: "Categoría 2",
        headquarters_id: "hq-1",
        headquarter_name: "hq-1",
        headquarter_director: "",
        phone: "123",
        guardian: "",
        registry_date: "2026-01-01",
        status: "activo",
        performance: 77,
      },
    ]);
  });

  it("renders status badges for known and unknown statuses", () => {
    const { rerender } = render(getStatusBadge("activo"));
    expect(screen.getByText("Activo")).toBeInTheDocument();

    rerender(getStatusBadge("pendiente"));
    expect(screen.getByText("Pendiente")).toBeInTheDocument();

    rerender(getStatusBadge("inactivo"));
    expect(screen.getByText("Inactivo")).toBeInTheDocument();

    rerender(getStatusBadge("suspendido"));
    expect(screen.getByText("Suspendido")).toBeInTheDocument();

    rerender(getStatusBadge("otro"));
    expect(screen.getByText("otro")).toBeInTheDocument();
  });
});
