export const getHeadquarterDirectorLabel = (
  user: {
    first_name?: string | null;
    last_name?: string | null;
  } | null | undefined,
): string => {
  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  return fullName ? `Director de sede: ${fullName}` : "Director de sede";
};
