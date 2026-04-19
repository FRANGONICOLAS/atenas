import {
  buildEvaluationInsertPayload,
  getEvaluationComment,
  getEvaluationDetailByType,
  hasEvaluationDetail,
  normalizeEvaluationType,
} from "@/lib/evaluationUtils";
import type { EvaluationRow } from "@/api/types";

const makeEval = (
  partial: Partial<
    Pick<
      EvaluationRow,
      | "type"
      | "anthropometric_detail"
      | "technical_tactic_detail"
      | "emotional_detail"
    >
  >,
) => ({
  type: "technical_tactic",
  anthropometric_detail: null,
  technical_tactic_detail: null,
  emotional_detail: null,
  ...partial,
});

describe("evaluationUtils unit", () => {
  describe("normalizeEvaluationType", () => {
    it("normalizes supported aliases and returns null for unknown", () => {
      expect(normalizeEvaluationType("anthropometric")).toBe("ANTHROPOMETRIC");
      expect(normalizeEvaluationType("TECHNICAL")).toBe("TECHNICAL");
      expect(normalizeEvaluationType("technical_tactic")).toBe("TECHNICAL");
      expect(normalizeEvaluationType("EMOTIONAL")).toBe("EMOTIONAL");
      expect(normalizeEvaluationType("psychological_emotional")).toBe(
        "EMOTIONAL",
      );
      expect(normalizeEvaluationType("other")).toBeNull();
      expect(normalizeEvaluationType(undefined)).toBeNull();
    });
  });

  describe("hasEvaluationDetail", () => {
    it("returns false for null, primitives, arrays and blank-only object", () => {
      expect(hasEvaluationDetail(null)).toBe(false);
      expect(hasEvaluationDetail(undefined)).toBe(false);
      expect(hasEvaluationDetail([])).toBe(false);
      expect(hasEvaluationDetail("x" as unknown as object)).toBe(false);
      expect(
        hasEvaluationDetail({
          a: " ",
          b: null,
          c: undefined,
        }),
      ).toBe(false);
    });

    it("returns true for meaningful values", () => {
      expect(hasEvaluationDetail({ a: "ok" })).toBe(true);
      expect(hasEvaluationDetail({ a: 0 })).toBe(true);
      expect(hasEvaluationDetail({ a: false })).toBe(true);
      expect(hasEvaluationDetail({ a: { nested: true } })).toBe(true);
    });
  });

  describe("getEvaluationDetailByType", () => {
    it("returns null for unknown type", () => {
      const detail = getEvaluationDetailByType(
        makeEval({
          type: "unknown",
          technical_tactic_detail: { pase: 4 },
        }),
      );

      expect(detail).toBeNull();
    });

    it("parses valid json string detail and rejects invalid/malformed detail", () => {
      const parsed = getEvaluationDetailByType(
        makeEval({
          type: "emotional",
          emotional_detail: '{"observaciones":"bien"}',
        }),
      );
      expect(parsed).toEqual({ observaciones: "bien" });

      const invalidJson = getEvaluationDetailByType(
        makeEval({
          type: "emotional",
          emotional_detail: "{bad-json}",
        }),
      );
      expect(invalidJson).toBeNull();

      const jsonPrimitive = getEvaluationDetailByType(
        makeEval({
          type: "emotional",
          emotional_detail: "123",
        }),
      );
      expect(jsonPrimitive).toBeNull();

      const arrayRaw = getEvaluationDetailByType(
        makeEval({
          type: "emotional",
          emotional_detail: ["x"] as unknown as EvaluationRow["emotional_detail"],
        }),
      );
      expect(arrayRaw).toBeNull();
    });

    it("returns object detail by normalized type", () => {
      const tech = getEvaluationDetailByType(
        makeEval({
          type: "technical_tactic",
          technical_tactic_detail: { pase: 4 },
        }),
      );
      const anth = getEvaluationDetailByType(
        makeEval({
          type: "anthropometric",
          anthropometric_detail: { peso: 60 },
        }),
      );

      expect(tech).toEqual({ pase: 4 });
      expect(anth).toEqual({ peso: 60 });
    });
  });

  describe("getEvaluationComment", () => {
    it("returns first available comment key or empty string", () => {
      expect(
        getEvaluationComment(
          makeEval({
            type: "emotional",
            emotional_detail: { observaciones: "obs" },
          }),
        ),
      ).toBe("obs");

      expect(
        getEvaluationComment(
          makeEval({
            type: "emotional",
            emotional_detail: { observation: "observation" },
          }),
        ),
      ).toBe("observation");

      expect(
        getEvaluationComment(
          makeEval({
            type: "emotional",
            emotional_detail: { observacion: "observacion" },
          }),
        ),
      ).toBe("observacion");

      expect(
        getEvaluationComment(
          makeEval({
            type: "emotional",
            emotional_detail: { comentarios: "comentarios" },
          }),
        ),
      ).toBe("comentarios");

      expect(
        getEvaluationComment(
          makeEval({
            type: "emotional",
            emotional_detail: { comentarios: 10 },
          }),
        ),
      ).toBe("");
    });
  });

  describe("buildEvaluationInsertPayload", () => {
    it("keeps only matching detail field based on type", () => {
      const anth = buildEvaluationInsertPayload({
        type: "ANTHROPOMETRIC",
        anthropometric_detail: { peso: 70 },
        technical_tactic_detail: { pase: 4 },
        emotional_detail: { observaciones: "x" },
      });

      const tech = buildEvaluationInsertPayload({
        type: "TECHNICAL",
        anthropometric_detail: { peso: 70 },
        technical_tactic_detail: { pase: 4 },
        emotional_detail: { observaciones: "x" },
      });

      const emo = buildEvaluationInsertPayload({
        type: "EMOTIONAL",
        anthropometric_detail: { peso: 70 },
        technical_tactic_detail: { pase: 4 },
        emotional_detail: { observaciones: "x" },
      });

      expect(anth).toEqual({
        type: "ANTHROPOMETRIC",
        anthropometric_detail: { peso: 70 },
        technical_tactic_detail: null,
        emotional_detail: null,
      });
      expect(tech).toEqual({
        type: "TECHNICAL",
        anthropometric_detail: null,
        technical_tactic_detail: { pase: 4 },
        emotional_detail: null,
      });
      expect(emo).toEqual({
        type: "EMOTIONAL",
        anthropometric_detail: null,
        technical_tactic_detail: null,
        emotional_detail: { observaciones: "x" },
      });
    });
  });
});
