import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    const result = cn("px-2", "px-4", "text-sm");

    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
    expect(result).toContain("text-sm");
  });
});
