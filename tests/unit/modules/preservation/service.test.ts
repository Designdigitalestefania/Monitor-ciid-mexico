import { describe, it, expect, beforeEach } from "vitest";
import { PreservationService } from "../../../../src/modules/preservation/service.js";
import { crearActor, registrarActor, type Actor } from "../../../../src/domain/actor.js";
import {
  crearExpediente,
  registrarTransicion,
  type Expediente,
} from "../../../../src/domain/expediente.js";

describe("PreservationService", () => {
  let preservation: PreservationService;
  let periodista: Actor;

  beforeEach(() => {
    preservation = new PreservationService();
    periodista = crearActor({
      userId: "u-p1",
      nombre: "Periodista",
      rol: "periodista",
      tenantId: "monitor-noticias",
    });
  });

  function expedientePublicado(): Expediente {
    const actorReg = registrarActor(
      crearActor({
        userId: "sys",
        nombre: "Sistema",
        rol: "sistema",
        tenantId: "monitor-noticias",
      })
    );

    const base = crearExpediente({
      id: "CIID-2026-0001",
      tenantId: "monitor-noticias",
      origen: "ciudadania",
      territorio: { estado: "Oaxaca", region: "Sierra Norte" },
      lenguas: [
        {
          lenguaId: "zapoteco",
          lenguaNombre: "Zapoteco",
          varianteId: "zap-sierra",
          varianteNombre: "Zapoteco de la Sierra",
          validadoPor: "hablante-001",
        },
      ],
    });

    return registrarTransicion(
      { ...base, etapaActual: "PUBLISHED" },
      { hasta: "PUBLISHED", actor: actorReg, razon: "test setup" }
    );
  }

  it("preserva un expediente publicado", () => {
    const exp = expedientePublicado();
    const r = preservation.preservar({ expediente: exp, actor: periodista });
    expect(r.exito).toBe(true);
    expect(r.expediente?.etapaActual).toBe("PRESERVED");
    expect(preservation.contar()).toBe(1);
  });

  it("genera registro patrimonial con metadatos", () => {
    const exp = expedientePublicado();
    const r = preservation.preservar({ expediente: exp, actor: periodista });
    expect(r.registro).toBeDefined();
    expect(r.registro?.expedienteId).toBe("CIID-2026-0001");
    expect(r.registro?.tenantId).toBe("monitor-noticias");
    expect(r.registro?.preservadoPor).toBe("Periodista");
    expect(r.registro?.territorio.estado).toBe("Oaxaca");
    expect(r.registro?.lenguas.length).toBe(1);
    expect(r.registro?.hashDocumental).toContain("sha-local-");
    expect(r.registro?.version).toBe("1.0.0");
  });

  it("rechaza preservar desde etapa distinta a PUBLISHED", () => {
    const base = crearExpediente({
      id: "CIID-2026-0002",
      tenantId: "monitor-noticias",
      origen: "ciudadania",
      territorio: { estado: "Oaxaca" },
    });
    const r = preservation.preservar({
      expediente: base,
      actor: periodista,
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("PUBLISHED");
  });

  it("rechaza preservar expediente ya preservado", () => {
    const exp = expedientePublicado();
    const r1 = preservation.preservar({ expediente: exp, actor: periodista });
    if (!r1.expediente) throw new Error("sin expediente");
    const r2 = preservation.preservar({
      expediente: r1.expediente,
      actor: periodista,
    });
    expect(r2.exito).toBe(false);
    expect(r2.razon).toBeDefined();
    expect(r2.razon?.length).toBeGreaterThan(0);
  });

  it("rechaza preservar expediente sin transiciones", () => {
    const base = crearExpediente({
      id: "CIID-2026-0003",
      tenantId: "monitor-noticias",
      origen: "ciudadania",
      territorio: { estado: "Oaxaca" },
    });
    const sinTransiciones: Expediente = { ...base, etapaActual: "PUBLISHED" };
    const r = preservation.preservar({
      expediente: sinTransiciones,
      actor: periodista,
    });
    expect(r.exito).toBe(false);
  });

  it("obtiene registro patrimonial por id", () => {
    const exp = expedientePublicado();
    preservation.preservar({ expediente: exp, actor: periodista });
    const r = preservation.obtenerRegistro("CIID-2026-0001");
    expect(r).not.toBeNull();
    expect(r?.version).toBe("1.0.0");
  });

  it("devuelve null si registro no existe", () => {
    expect(preservation.obtenerRegistro("no-existe")).toBeNull();
  });

  it("lista registros por tenant", () => {
    const exp = expedientePublicado();
    preservation.preservar({ expediente: exp, actor: periodista });
    expect(preservation.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(preservation.listarPorTenant("otro-tenant").length).toBe(0);
  });

  it("cuenta registros patrimoniales", () => {
    expect(preservation.contar()).toBe(0);
    const exp = expedientePublicado();
    preservation.preservar({ expediente: exp, actor: periodista });
    expect(preservation.contar()).toBe(1);
  });

  it("genera hash determinista por expediente", () => {
    const exp = expedientePublicado();
    const r = preservation.preservar({ expediente: exp, actor: periodista });
    const registro1 = r.registro;

    preservation.limpiar();

    const r2 = preservation.preservar({ expediente: exp, actor: periodista });
    const registro2 = r2.registro;

    expect(registro1?.hashDocumental).toBeDefined();
    expect(registro2?.hashDocumental).toBeDefined();
    expect(registro1?.hashDocumental.length).toBeGreaterThan(10);
  });
});
