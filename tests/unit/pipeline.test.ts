import { describe, it, expect } from "vitest";
import { nextStage, PIPELINE_STAGES, ciid } from "../../src/index.js";
import { validateTransition } from "../../src/domain/pipeline.js";

describe("PIPELINE_STAGES", () => {
  it("tiene 8 etapas formales", () => {
    expect(PIPELINE_STAGES.length).toBe(8);
  });

  it("inicia en RECEIVED y termina en PRESERVED", () => {
    expect(PIPELINE_STAGES[0]).toBe("RECEIVED");
    expect(PIPELINE_STAGES[PIPELINE_STAGES.length - 1]).toBe("PRESERVED");
  });
});

describe("nextStage", () => {
  it("avanza de RECEIVED a PROCESSING", () => {
    expect(nextStage("RECEIVED")).toBe("PROCESSING");
  });

  it("devuelve null en la última etapa", () => {
    expect(nextStage("PRESERVED")).toBeNull();
  });
});

describe("validateTransition", () => {
  it("rechaza saltos de etapa", () => {
    const result = validateTransition("VERIFICATION", "PUBLISHED");
    expect(result.valid).toBe(false);
  });

  it("requiere actor humano en DECISION", () => {
    const result = validateTransition("VERIFICATION", "DECISION", false);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("actor humano");
  });

  it("acepta DECISION con actor humano", () => {
    const result = validateTransition("VERIFICATION", "DECISION", true);
    expect(result.valid).toBe(true);
  });
});

describe("ciid identity", () => {
  it("respeta el principio rector", () => {
    expect(ciid.principle).toBe("La tecnología asiste. El periodista decide.");
  });
});
