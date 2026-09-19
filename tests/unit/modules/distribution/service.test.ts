import { describe, it, expect, beforeEach } from "vitest";
import { DistributionService } from "../../../../src/modules/distribution/service.js";

describe("DistributionService", () => {
  let service: DistributionService;

  beforeEach(() => {
    service = new DistributionService();
  });

  function distribucionBase(overrides: Partial<{
    id: string;
    expedienteId: string;
    canal: "web" | "facebook" | "instagram" | "x" | "youtube" | "radio-comunitaria" | "whatsapp-breve";
    titulo: string;
    cuerpo: string;
  }> = {}) {
    return {
      id: overrides.id ?? "DIS-001",
      expedienteId: overrides.expedienteId ?? "CIID-2026-0001",
      tenantId: "monitor-noticias",
      canal: overrides.canal ?? ("web" as const),
      titulo: overrides.titulo ?? "Titulo demo",
      cuerpo: overrides.cuerpo ?? "Cuerpo de la nota",
      creadaPor: "u-p1",
    };
  }

  it("crea una distribucion valida en canal web", () => {
    const r = service.distribuir(distribucionBase());
    expect(r.exito).toBe(true);
    expect(r.distribucion?.canal).toBe("web");
    expect(r.distribucion?.estado).toBe("activa");
    expect(r.distribucion?.version).toBe(1);
    expect(service.contar()).toBe(1);
  });

  it("rechaza id sin prefijo DIS-", () => {
    const r = service.distribuir(distribucionBase({ id: "otro-id" }));
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("DIS-");
  });

  it("rechaza canal invalido", () => {
    const r = service.distribuir({
      ...distribucionBase(),
      canal: "tiktok" as never,
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("Canal no valido");
  });

  it("rechaza titulo vacio", () => {
    const r = service.distribuir(distribucionBase({ titulo: "" }));
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("titulo");
  });

  it("rechaza cuerpo vacio", () => {
    const r = service.distribuir(distribucionBase({ cuerpo: "" }));
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("cuerpo");
  });

  it("rechaza distribucion duplicada", () => {
    service.distribuir(distribucionBase());
    const r2 = service.distribuir(distribucionBase());
    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya existe");
  });

  it("incrementa version por canal", () => {
    service.distribuir(distribucionBase({ id: "DIS-001" }));
    service.distribuir(distribucionBase({ id: "DIS-002" }));
    const r3 = service.distribuir(distribucionBase({ id: "DIS-003" }));
    expect(r3.distribucion?.version).toBe(3);
  });

  it("version independiente por canal", () => {
    service.distribuir(distribucionBase({ id: "DIS-010", canal: "web" }));
    service.distribuir(distribucionBase({ id: "DIS-011", canal: "web" }));
    const r = service.distribuir(distribucionBase({ id: "DIS-012", canal: "facebook" }));
    expect(r.distribucion?.version).toBe(1);
  });

  it("obtiene distribucion por id", () => {
    service.distribuir(distribucionBase({ id: "DIS-020" }));
    const r = service.obtenerDistribucion("DIS-020");
    expect(r).not.toBeNull();
    expect(r?.id).toBe("DIS-020");
  });

  it("devuelve null si no existe", () => {
    expect(service.obtenerDistribucion("DIS-999")).toBeNull();
  });

  it("lista por expediente", () => {
    service.distribuir(distribucionBase({ id: "DIS-030", expedienteId: "CIID-A" }));
    service.distribuir(distribucionBase({ id: "DIS-031", expedienteId: "CIID-B" }));
    expect(service.listarPorExpediente("CIID-A").length).toBe(1);
    expect(service.listarPorExpediente("CIID-B").length).toBe(1);
  });

  it("lista por tenant", () => {
    service.distribuir(distribucionBase({ id: "DIS-040" }));
    service.distribuir({
      ...distribucionBase({ id: "DIS-041" }),
      tenantId: "municipio-a",
    });
    expect(service.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(service.listarPorTenant("municipio-a").length).toBe(1);
  });

  it("filtra por canal", () => {
    service.distribuir(distribucionBase({ id: "DIS-050", canal: "web" }));
    service.distribuir(distribucionBase({ id: "DIS-051", canal: "facebook" }));
    const web = service.filtrar({ canal: "web" });
    expect(web.length).toBe(1);
    expect(web[0].canal).toBe("web");
  });

  it("retira una distribucion con motivo", () => {
    service.distribuir(distribucionBase({ id: "DIS-060" }));
    const r = service.retirar("DIS-060", "Error en el titular");
    expect(r.exito).toBe(true);
    expect(r.distribucion?.estado).toBe("retirada");
    expect(r.distribucion?.retiradaEn).toBeTruthy();
    expect(r.distribucion?.motivoRetiro).toBe("Error en el titular");
  });

  it("rechaza retiro sin motivo", () => {
    service.distribuir(distribucionBase({ id: "DIS-070" }));
    const r = service.retirar("DIS-070", "");
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("motivo");
  });

  it("rechaza retiro de distribucion inexistente", () => {
    const r = service.retirar("DIS-999", "motivo");
    expect(r.exito).toBe(false);
  });

  it("no permite retirar dos veces la misma distribucion", () => {
    service.distribuir(distribucionBase({ id: "DIS-080" }));
    service.retirar("DIS-080", "motivo 1");
    const r2 = service.retirar("DIS-080", "motivo 2");
    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya esta retirada");
  });

  it("filtra distribuciones retiradas", () => {
    service.distribuir(distribucionBase({ id: "DIS-090" }));
    service.distribuir(distribucionBase({ id: "DIS-091" }));
    service.retirar("DIS-090", "motivo");
    const activas = service.filtrar({ estado: "activa" });
    expect(activas.length).toBe(1);
  });
});
