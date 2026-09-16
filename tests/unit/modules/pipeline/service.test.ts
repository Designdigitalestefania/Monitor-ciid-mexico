import { describe, it, expect, beforeEach } from "vitest";
import { PipelineService } from "../../../../src/modules/pipeline/service.js";
import { crearActor, type Actor } from "../../../../src/domain/actor.js";
import { crearExpediente, type Expediente } from "../../../../src/domain/expediente.js";

describe("PipelineService", () => {
  let pipeline: PipelineService;
  let periodista: Actor;
  let sistema: Actor;
  let ciudadano: Actor;

  beforeEach(() => {
    pipeline = new PipelineService();
    periodista = crearActor({
      userId: "u-p1",
      nombre: "Periodista",
      rol: "periodista",
      tenantId: "monitor-noticias",
    });
    sistema = crearActor({
      userId: "sys",
      nombre: "Sistema",
      rol: "sistema",
      tenantId: "monitor-noticias",
    });
    ciudadano = crearActor({
      userId: "u-c1",
      nombre: "Ciudadano",
      rol: "ciudadano",
      tenantId: "monitor-noticias",
    });
  });

  function expedienteEn(etapa: string): Expediente {
    const base = crearExpediente({
      id: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      origen: "ciudadania",
      territorio: { estado: "Oaxaca" },
    });
    return { ...base, etapaActual: etapa as Expediente["etapaActual"] };
  }

  it("avanza de RECEIVED a PROCESSING", () => {
    const exp = expedienteEn("RECEIVED");
    const r = pipeline.avanzar({ expediente: exp, actor: sistema });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("PROCESSING");
  });

  it("avanza de PROCESSING a CLASSIFIED", () => {
    const exp = expedienteEn("PROCESSING");
    const r = pipeline.avanzar({ expediente: exp, actor: sistema });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("CLASSIFIED");
  });

  it("falla al avanzar desde PRESERVED", () => {
    const exp = expedienteEn("PRESERVED");
    const r = pipeline.avanzar({ expediente: exp, actor: sistema });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("final");
  });

  it("no permite entrar a DECISION con actor no humano", () => {
    const exp = expedienteEn("VERIFICATION");
    const r = pipeline.avanzar({ expediente: exp, actor: sistema });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("actor humano");
  });

  it("permite entrar a DECISION con periodista", () => {
    const exp = expedienteEn("VERIFICATION");
    const r = pipeline.avanzar({ expediente: exp, actor: periodista });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("DECISION");
  });

  it("no permite entrar a DECISION con ciudadano", () => {
    const exp = expedienteEn("VERIFICATION");
    const r = pipeline.avanzar({ expediente: exp, actor: ciudadano });
    expect(r.exito).toBe(false);
  });

  it("aprueba publicacion desde DECISION con periodista", () => {
    const exp = expedienteEn("DECISION");
    const r = pipeline.aprobarPublicacion({ expediente: exp, actor: periodista });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("PUBLISHED");
  });

  it("rechaza publicacion desde etapa distinta a DECISION", () => {
    const exp = expedienteEn("VERIFICATION");
    const r = pipeline.aprobarPublicacion({ expediente: exp, actor: periodista });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("DECISION");
  });

  it("rechaza publicacion con actor no editor", () => {
    const exp = expedienteEn("DECISION");
    const r = pipeline.aprobarPublicacion({ expediente: exp, actor: ciudadano });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("periodistas");
  });

  it("devuelve expediente desde DECISION", () => {
    const exp = expedienteEn("DECISION");
    const r = pipeline.devolver({
      expediente: exp,
      actor: periodista,
      razon: "Falta contraste con fuente",
    });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("EDITORIAL_REVIEW");
  });

  it("no permite devolver desde etapa no permitida", () => {
    const exp = expedienteEn("VERIFICATION");
    const r = pipeline.devolver({
      expediente: exp,
      actor: periodista,
      razon: "test",
    });
    expect(r.exito).toBe(false);
  });

  it("rechaza devolucion sin razon", () => {
    const exp = expedienteEn("DECISION");
    const r = pipeline.devolver({
      expediente: exp,
      actor: periodista,
      razon: "",
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("razon");
  });

  it("rechaza expediente desde VERIFICATION", () => {
    const exp = expedienteEn("VERIFICATION");
    const r = pipeline.rechazar({
      expediente: exp,
      actor: periodista,
      razon: "Informacion no verificable",
    });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("PRESERVED");
  });

  it("rechaza expediente desde DECISION", () => {
    const exp = expedienteEn("DECISION");
    const r = pipeline.rechazar({
      expediente: exp,
      actor: periodista,
      razon: "No cumple estandares editoriales",
    });
    expect(r.exito).toBe(true);
  });

  it("no permite rechazar desde RECEIVED", () => {
    const exp = expedienteEn("RECEIVED");
    const r = pipeline.rechazar({
      expediente: exp,
      actor: periodista,
      razon: "test",
    });
    expect(r.exito).toBe(false);
  });

  it("devuelve historial completo de transiciones", () => {
    const exp = expedienteEn("RECEIVED");
    const r1 = pipeline.avanzar({ expediente: exp, actor: sistema });
    if (!r1.expediente) throw new Error("sin expediente");
    const r2 = pipeline.avanzar({ expediente: r1.expediente, actor: sistema });
    if (!r2.expediente) throw new Error("sin expediente");

    const hist = pipeline.historial(r2.expediente);
    expect(hist.length).toBe(2);
    expect(hist[0].desde).toBe("RECEIVED");
    expect(hist[0].hasta).toBe("PROCESSING");
    expect(hist[1].desde).toBe("PROCESSING");
    expect(hist[1].hasta).toBe("CLASSIFIED");
  });

  it("etapaActual devuelve la etapa correcta", () => {
    const exp = expedienteEn("DECISION");
    expect(pipeline.etapaActual(exp)).toBe("DECISION");
  });
});
