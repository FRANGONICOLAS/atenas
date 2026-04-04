import {
  calculateIMC,
  calculatePerformance,
  calculateWaistHipRatio,
  extractSex,
  getEvaluationScore,
  getTechnicalAverage,
} from "@/lib/beneficiaryCalculations";
import type { EvaluationRow } from "@/api/types";

function makeEvaluation(partial: Partial<EvaluationRow>): EvaluationRow {
  return {
    id: "eval-1",
    created_at: "2026-01-01T00:00:00.000Z",
    type: "technical_tactic",
    questions_answers: null,
    anthropometric_detail: null,
    technical_tactic_detail: null,
    emotional_detail: null,
    ...partial,
  };
}

describe("beneficiaryCalculations unit", () => {
  describe("calculatePerformance", () => {
    it("returns 0 when technical data is missing", () => {
      expect(calculatePerformance(undefined)).toBe(0);
      expect(calculatePerformance(null)).toBe(0);
    });

    it("returns 0 when there are no numeric skills", () => {
      expect(
        calculatePerformance({
          pase: undefined,
          recepcion: null,
          remate: "x",
        } as unknown as Record<string, unknown>),
      ).toBe(0);
    });

    it("calculates performance in 0-100 scale", () => {
      expect(
        calculatePerformance({
          pase: 5,
          recepcion: 3,
          remate: 1,
          regate: 3,
          ubicacion_espacio_temporal: 5,
        }),
      ).toBe(60);
    });

    it("clamps values below 0 and above 100", () => {
      expect(calculatePerformance({ pase: 0 })).toBe(0);
      expect(calculatePerformance({ pase: 10 })).toBe(100);
    });
  });

  describe("extractSex", () => {
    it("extracts genero or returns undefined", () => {
      expect(extractSex({ genero: "hombre" })).toBe("hombre");
      expect(extractSex(undefined)).toBeUndefined();
      expect(extractSex(null)).toBeUndefined();
    });
  });

  describe("calculateIMC", () => {
    it("returns undefined for missing or invalid IMC inputs", () => {
      expect(calculateIMC(undefined, 170)).toBeUndefined();
      expect(calculateIMC(70, undefined)).toBeUndefined();
      expect(calculateIMC(70, 0)).toBeUndefined();
    });

    it("calculates and rounds IMC to 2 decimals", () => {
      expect(calculateIMC(70, 175)).toBe(22.86);
    });
  });

  describe("calculateWaistHipRatio", () => {
    it("returns undefined for missing or invalid waist-hip inputs", () => {
      expect(calculateWaistHipRatio(undefined, 90)).toBeUndefined();
      expect(calculateWaistHipRatio(80, undefined)).toBeUndefined();
      expect(calculateWaistHipRatio(80, 0)).toBeUndefined();
    });

    it("calculates and rounds ratio to 2 decimals", () => {
      expect(calculateWaistHipRatio(82, 97)).toBe(0.85);
    });
  });

  describe("getTechnicalAverage", () => {
    it("returns 0 when technical data is missing or has no numeric values", () => {
      expect(getTechnicalAverage(undefined)).toBe(0);
      expect(getTechnicalAverage(null)).toBe(0);
      expect(
        getTechnicalAverage({
          pase: undefined,
          recepcion: "bad",
        } as unknown as Record<string, unknown>),
      ).toBe(0);
    });

    it("calculates average and rounds to 1 decimal", () => {
      expect(
        getTechnicalAverage({
          pase: 4,
          recepcion: 3,
          remate: 5,
        }),
      ).toBe(4);

      expect(
        getTechnicalAverage({
          pase: 4,
          recepcion: 3,
          remate: 3,
        }),
      ).toBe(3.3);
    });
  });

  describe("getEvaluationScore", () => {
    it("returns performance for technical_tactic evaluation", () => {
      const evaluation = makeEvaluation({
        type: "technical_tactic",
        questions_answers: {
          pase: 5,
          recepcion: 5,
          remate: 5,
          regate: 5,
          ubicacion_espacio_temporal: 5,
        },
      });

      expect(getEvaluationScore(evaluation)).toBe(100);
    });

    it("handles anthropometric with null data or missing fields", () => {
      expect(
        getEvaluationScore(
          makeEvaluation({
            type: "anthropometric",
            questions_answers: null,
          }),
        ),
      ).toBe(0);

      expect(
        getEvaluationScore(
          makeEvaluation({
            type: "anthropometric",
            questions_answers: {
              peso: undefined,
              talla: 170,
            },
          }),
        ),
      ).toBe(0);
    });

    it("uses anthropometric imc when provided as number", () => {
      const evaluation = makeEvaluation({
        type: "anthropometric",
        questions_answers: {
          imc: 24.5,
          peso: 70,
          talla: 175,
        },
      });

      expect(getEvaluationScore(evaluation)).toBe(24.5);
    });

    it("calculates anthropometric score from peso/talla when imc is not numeric", () => {
      const evaluation = makeEvaluation({
        type: "anthropometric",
        questions_answers: {
          imc: "24.5",
          peso: 70,
          talla: 175,
        },
      });

      expect(getEvaluationScore(evaluation)).toBe(22.86);
    });

    it("returns 0 for psychological_emotional and unknown types", () => {
      expect(
        getEvaluationScore(
          makeEvaluation({
            type: "psychological_emotional",
            questions_answers: { observaciones: "ok" },
          }),
        ),
      ).toBe(0);

      expect(
        getEvaluationScore(
          makeEvaluation({
            type: null,
            questions_answers: { any: "value" },
          }),
        ),
      ).toBe(0);
    });
  });
});
