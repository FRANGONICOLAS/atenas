import type { Headquarter, User } from "@/types";

export interface ReportContext {
  headquarterMap: Record<string, string>;
  headquarterDirectorMap: Record<string, string>;
  generatedByLabel: string;
}

export function buildReportContext(
  headquarters: Headquarter[],
  headquarterDirectorNames: Record<string, string>,
  user: Pick<User, "first_name" | "last_name"> | null,
): ReportContext {
  const headquarterMap: Record<string, string> = {};
  const headquarterDirectorMap: Record<string, string> = {};

  headquarters.forEach((hq) => {
    if (hq.headquarters_id) {
      headquarterMap[hq.headquarters_id] = hq.name;
    }
    if (hq.headquarters_id) {
      headquarterDirectorMap[hq.headquarters_id] =
        headquarterDirectorNames[hq.user_id] || "Desconocido";
    }
  });

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const currentUserName = `${firstName} ${lastName}`.trim();
  const generatedByLabel = currentUserName
    ? `Director de sede: ${currentUserName}`
    : "Director de sede";

  return { headquarterMap, headquarterDirectorMap, generatedByLabel };
}
