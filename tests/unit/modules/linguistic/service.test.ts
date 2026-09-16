import { describe, it, expect, beforeEach } from "vitest";
import { LinguisticService } from "../../../../src/modules/linguistic/service.js";

describe("LinguisticService", () => {
  let service: LinguisticService;

  beforeEach(() => {
    service = new LinguisticService();
  });

  function acreditarHablanteBase() {
    return service.acreditarHablante({
      id: "HAB-001",
      tenantId: "monitor-noticias",
      nombre: "Hablante Demo",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "Sierra Norte",
      acreditadoPor: "u-coordinador",
    });
  }

  it("acredita un hablante nativo valido", () => {
    const r = acreditarHablanteBase();
    expect(r.exito).toBe(true);
    expect(r.hablante?.id).toBe("HAB-001");
    expect(r.hablante?.varianteId).toBe("zap-sierra");
    expect(service.contarHablantes()).toBe(1);
  });

  it("rechaza id de hablante sin prefijo HAB-", () => {
    const r = service.acreditarHablante({
      id: "otro-id",
      tenantId: "monitor-noticias",
      nombre: "X",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "X",
      acreditadoPor: "u",
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("HAB-");
  });

  it("rechaza hablante sin comunidad de referencia", () => {
    const r = service.acreditarHablante({
      id: "HAB-002",
      tenantId: "monitor-noticias",
      nombre: "X",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "",
      acreditadoPor: "u",
    });
    expect(r.exito).toBe(false);
  });

  it("rechaza hablante duplicado", () => {
    acreditarHablanteBase();
    const r = service.acreditarHablante({
      id: "HAB-001",
      tenantId: "monitor-noticias",
      nombre: "Otro",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comunidadReferencia: "X",
      acreditadoPor: "u",
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("ya acreditado");
  });

  it("lista hablantes por tenant", () => {
    acreditarHablanteBase();
    service.acreditarHablante({
      id: "HAB-002",
      tenantId: "municipio-a",
      nombre: "Otro",
      lenguaId: "mixteco",
      varianteId: "mix-alta",
      comunidadReferencia: "Mixteca",
      acreditadoPor: "u",
    });
    expect(service.listarHablantesPorTenant("monitor-noticias").length).toBe(1);
    expect(service.listarHablantesPorTenant("municipio-a").length).toBe(1);
  });

  it("registra validacion en estado pendiente", () => {
    acreditarHablanteBase();
    const r = service.registrarValidacion({
      id: "VAL-001",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
      comentario: "Revision inicial",
    });
    expect(r.exito).toBe(true);
    expect(r.validacion?.estado).toBe("pendiente");
    expect(service.contarValidaciones()).toBe(1);
  });

  it("rechaza id de validacion sin prefijo VAL-", () => {
    acreditarHablanteBase();
    const r = service.registrarValidacion({
      id: "otro-id",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("VAL-");
  });

  it("rechaza validacion si hablante no existe", () => {
    const r = service.registrarValidacion({
      id: "VAL-002",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-999",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("Hablante no encontrado");
  });

  it("rechaza validacion si variante no coincide con hablante", () => {
    acreditarHablanteBase();
    const r = service.registrarValidacion({
      id: "VAL-003",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-valles",
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("no esta acreditado");
  });

  it("rechaza validacion duplicada", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-004",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    const r2 = service.registrarValidacion({
      id: "VAL-004",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya existe");
  });

  it("aprueba una validacion pendiente", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-005",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    const r = service.aprobarValidacion("VAL-005");
    expect(r.exito).toBe(true);
    expect(r.validacion?.estado).toBe("validada");
    expect(r.validacion?.validadaEn).toBeTruthy();
  });

  it("rechaza aprobar validacion inexistente", () => {
    const r = service.aprobarValidacion("VAL-999");
    expect(r.exito).toBe(false);
  });

  it("no permite aprobar dos veces la misma validacion", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-006",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    service.aprobarValidacion("VAL-006");
    const r2 = service.aprobarValidacion("VAL-006");
    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya esta aprobada");
  });

  it("rechaza una validacion con motivo obligatorio", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-007",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    const r = service.rechazarValidacion("VAL-007", "Variante incorrecta");
    expect(r.exito).toBe(true);
    expect(r.validacion?.estado).toBe("rechazada");
    expect(r.validacion?.motivoRechazo).toBe("Variante incorrecta");
  });

  it("rechaza validacion sin motivo", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-008",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    const r = service.rechazarValidacion("VAL-008", "");
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("motivo");
  });

  it("lista validaciones por expediente", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-009",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    service.registrarValidacion({
      id: "VAL-010",
      expedienteId: "CIID-2026-0002",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    expect(
      service.listarValidacionesPorExpediente("CIID-2026-0001").length
    ).toBe(1);
  });

  it("filtra validaciones por estado", () => {
    acreditarHablanteBase();
    service.registrarValidacion({
      id: "VAL-011",
      expedienteId: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      hablanteId: "HAB-001",
      lenguaId: "zapoteco",
      varianteId: "zap-sierra",
    });
    service.aprobarValidacion("VAL-011");

    const validadas = service.filtrar({ estado: "validada" });
    expect(validadas.length).toBe(1);
  });
});
