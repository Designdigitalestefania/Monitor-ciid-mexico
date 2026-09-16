import { describe, it, expect, beforeEach } from "vitest";
import { CitizenService } from "../../../../src/modules/citizen/service.js";

describe("CitizenService", () => {
  let service: CitizenService;

  beforeEach(() => {
    service = new CitizenService();
  });

  function consentimientoValido() {
    return {
      otorgado: true,
      fecha: "2026-09-15T12:00:00Z",
      usoInformativo: true,
      usoPatrimonial: false,
    };
  }

  it("registra un reporte ciudadano valido", () => {
    const r = service.registrar({
      id: "CIU-2026-0001",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });
    expect(r.exito).toBe(true);
    expect(r.registro?.estado).toBe("activo");
    expect(r.registro?.canal).toBe("whatsapp");
    expect(service.contar()).toBe(1);
  });

  it("rechaza id sin prefijo CIU-", () => {
    const r = service.registrar({
      id: "otro-id",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("CIU-");
  });

  it("rechaza territorio sin estado", () => {
    const r = service.registrar({
      id: "CIU-2026-0002",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "" },
      consentimiento: consentimientoValido(),
    });
    expect(r.exito).toBe(false);
  });

  it("rechaza consentimiento no otorgado", () => {
    const r = service.registrar({
      id: "CIU-2026-0003",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: false,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: true,
        usoPatrimonial: false,
      },
    });
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("consentimiento");
  });

  it("rechaza consentimiento sin uso autorizado", () => {
    const r = service.registrar({
      id: "CIU-2026-0004",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: {
        otorgado: true,
        fecha: "2026-09-15T12:00:00Z",
        usoInformativo: false,
        usoPatrimonial: false,
      },
    });
    expect(r.exito).toBe(false);
  });

  it("rechaza reporte duplicado", () => {
    const input = {
      id: "CIU-2026-0005",
      tenantId: "monitor-noticias",
      canal: "whatsapp" as const,
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    };
    service.registrar(input);
    const r2 = service.registrar(input);
    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya existe");
  });

  it("obtiene reporte por id", () => {
    service.registrar({
      id: "CIU-2026-0006",
      tenantId: "monitor-noticias",
      canal: "correo",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });
    const r = service.obtenerPorId("CIU-2026-0006");
    expect(r).not.toBeNull();
    expect(r?.canal).toBe("correo");
  });

  it("devuelve null si reporte no existe", () => {
    expect(service.obtenerPorId("no-existe")).toBeNull();
  });

  it("lista reportes por tenant", () => {
    service.registrar({
      id: "CIU-2026-0007",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });
    service.registrar({
      id: "CIU-2026-0008",
      tenantId: "municipio-a",
      canal: "web",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    expect(service.listarPorTenant("monitor-noticias").length).toBe(1);
    expect(service.listarPorTenant("municipio-a").length).toBe(1);
  });

  it("filtra por canal", () => {
    service.registrar({
      id: "CIU-2026-0009",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });
    service.registrar({
      id: "CIU-2026-0010",
      tenantId: "monitor-noticias",
      canal: "web",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    const soloWhatsapp = service.filtrar({ canal: "whatsapp" });
    expect(soloWhatsapp.length).toBe(1);
    expect(soloWhatsapp[0].id).toBe("CIU-2026-0009");
  });

  it("vincula reporte a expediente", () => {
    service.registrar({
      id: "CIU-2026-0011",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    const r = service.vincularAExpediente("CIU-2026-0011", "CIID-2026-0001");
    expect(r.exito).toBe(true);
    expect(r.registro?.estado).toBe("vinculado");
    expect(r.registro?.expedienteId).toBe("CIID-2026-0001");
  });

  it("no permite vincular reporte inexistente", () => {
    const r = service.vincularAExpediente("CIU-9999-9999", "CIID-2026-0001");
    expect(r.exito).toBe(false);
  });

  it("retira un reporte con motivo", () => {
    service.registrar({
      id: "CIU-2026-0012",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    const r = service.retirar("CIU-2026-0012", "Solicitud de la comunidad");
    expect(r.exito).toBe(true);
    expect(r.registro?.estado).toBe("retirado");
    expect(r.registro?.retiradoEn).toBeTruthy();
    expect(r.registro?.motivoRetiro).toBe("Solicitud de la comunidad");
  });

  it("rechaza retiro sin motivo", () => {
    service.registrar({
      id: "CIU-2026-0013",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    const r = service.retirar("CIU-2026-0013", "");
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("motivo");
  });

  it("no permite retirar dos veces el mismo reporte", () => {
    service.registrar({
      id: "CIU-2026-0014",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    service.retirar("CIU-2026-0014", "motivo 1");
    const r2 = service.retirar("CIU-2026-0014", "motivo 2");
    expect(r2.exito).toBe(false);
    expect(r2.razon).toContain("ya esta retirado");
  });

  it("no permite vincular un reporte retirado", () => {
    service.registrar({
      id: "CIU-2026-0015",
      tenantId: "monitor-noticias",
      canal: "whatsapp",
      territorio: { estado: "Oaxaca" },
      consentimiento: consentimientoValido(),
    });

    service.retirar("CIU-2026-0015", "motivo");
    const r = service.vincularAExpediente("CIU-2026-0015", "CIID-2026-0001");
    expect(r.exito).toBe(false);
    expect(r.razon).toContain("retirado");
  });
});
