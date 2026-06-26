export const buildDateRange = (
  period: "day" | "week" | "month",
  referenceDate: Date,
) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  if (period === "day") {
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "week") {
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const monthStart = new Date(start);
  monthStart.setDate(1);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start: monthStart, end: monthEnd };
};

export const isEvaluationInRange = (
  dateString: string | null | undefined,
  range: { start: Date; end: Date },
) => {
  if (!dateString) return false;
  const value = new Date(dateString);
  return (
    !Number.isNaN(value.getTime()) && value >= range.start && value <= range.end
  );
};
