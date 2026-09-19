import { type Repository } from "../../persistence/types.js";
import { InMemoryRepository } from "../../persistence/in-memory.js";
import {
  validarIdHablante,
  validarIdValidacion,
  validarAcreditacion,
  validarValidacion,
  validarMotivoRechazo,
} from "./rules.js";
import {
  type AcreditarHablanteInput,
  type FiltrosValidacion,
  type Hablante,
  type ResultadoLinguistico,
  type ValidacionLinguistica,
  type ValidarInput,
} from "./types.js";

/**
 * Servicio de validacion linguistica.
 *
 * Acredita hablantes nativos y registra validaciones de contenido
 * en lenguas originarias, preservando la variante especifica de cada
 * comunidad. Ver ADR-003 y ADR-005.
 */
export class LinguisticService {
  constructor(
    private readonly hablantes: Repository<Hablante> =
      new InMemoryRepository<Hablante>(),
    private readonly validaciones: Repository<ValidacionLinguistica> =
      new InMemoryRepository<ValidacionLinguistica>()
  ) {}

  acreditarHablante(input: AcreditarHablanteInput): ResultadoLinguistico {
    const validaciones = [
      validarIdHablante(input.id),
      validarAcreditacion(input),
    ];

    for (const v of validaciones) {
      if (!v.exito) return v;
    }

    if (this.hablantes.existe(input.id)) {
      return { exito: false, razon: "Hablante ya acreditado: " + input.id };
    }

    const hablante: Hablante = {
      id: input.id,
      tenantId: input.tenantId,
      nombre: input.nombre,
      lenguaId: input.lenguaId,
      varianteId: input.varianteId,
      comunidadReferencia: input.comunidadReferencia,
      acreditadoEn: new Date().toISOString(),
      acreditadoPor: input.acreditadoPor,
    };

    this.hablantes.guardar(hablante);

    return { exito: true, hablante };
  }

  registrarValidacion(input: ValidarInput): ResultadoLinguistico {
    const validacionId = validarIdValidacion(input.id);
    if (!validacionId.exito) return validacionId;

    if (this.validaciones.existe(input.id)) {
      return { exito: false, razon: "Validacion ya existe: " + input.id };
    }

    const hablante = this.hablantes.obtener(input.hablanteId);
    if (!hablante) {
      return { exito: false, razon: "Hablante no encontrado: " + input.hablanteId };
    }

    const validacion = validarValidacion(input, hablante);
    if (!validacion.exito) return validacion;

    const nueva: ValidacionLinguistica = {
      id: input.id,
      expedienteId: input.expedienteId,
      tenantId: input.tenantId,
      hablanteId: input.hablanteId,
      lenguaId: input.lenguaId,
      varianteId: input.varianteId,
      estado: "pendiente",
      comentario: input.comentario ?? null,
      creadaEn: new Date().toISOString(),
      validadaEn: null,
      rechazadaEn: null,
      motivoRechazo: null,
    };

    this.validaciones.guardar(nueva);

    return { exito: true, validacion: nueva };
  }

  aprobarValidacion(id: string): ResultadoLinguistico {
    const validacion = this.validaciones.obtener(id);
    if (!validacion) {
      return { exito: false, razon: "Validacion no encontrada: " + id };
    }
    if (validacion.estado === "validada") {
      return { exito: false, razon: "La validacion ya esta aprobada" };
    }
    if (validacion.estado === "rechazada") {
      return { exito: false, razon: "La validacion ya esta rechazada" };
    }

    const actualizada: ValidacionLinguistica = {
      ...validacion,
      estado: "validada",
      validadaEn: new Date().toISOString(),
    };

    this.validaciones.guardar(actualizada);

    return { exito: true, validacion: actualizada };
  }

  rechazarValidacion(id: string, motivo: string): ResultadoLinguistico {
    const validacion = this.validaciones.obtener(id);
    if (!validacion) {
      return { exito: false, razon: "Validacion no encontrada: " + id };
    }

    const validacionMotivo = validarMotivoRechazo(motivo);
    if (!validacionMotivo.exito) return validacionMotivo;

    if (validacion.estado === "rechazada") {
      return { exito: false, razon: "La validacion ya esta rechazada" };
    }

    const actualizada: ValidacionLinguistica = {
      ...validacion,
      estado: "rechazada",
      rechazadaEn: new Date().toISOString(),
      motivoRechazo: motivo,
    };

    this.validaciones.guardar(actualizada);

    return { exito: true, validacion: actualizada };
  }

  obtenerValidacion(id: string): ValidacionLinguistica | null {
    return this.validaciones.obtener(id);
  }

  obtenerHablante(id: string): Hablante | null {
    return this.hablantes.obtener(id);
  }

  listarHablantesPorTenant(tenantId: string): Hablante[] {
    return this.hablantes.listar().filter((h) => h.tenantId === tenantId);
  }

  listarValidacionesPorExpediente(expedienteId: string): ValidacionLinguistica[] {
    return this.validaciones
      .listar()
      .filter((v) => v.expedienteId === expedienteId);
  }

  filtrar(filtros: FiltrosValidacion): ValidacionLinguistica[] {
    return this.validaciones.listar().filter((v) => {
      if (filtros.tenantId && v.tenantId !== filtros.tenantId) return false;
      if (filtros.expedienteId && v.expedienteId !== filtros.expedienteId) return false;
      if (filtros.estado && v.estado !== filtros.estado) return false;
      if (filtros.hablanteId && v.hablanteId !== filtros.hablanteId) return false;
      return true;
    });
  }

  contarHablantes(): number {
    return this.hablantes.contar();
  }

  contarValidaciones(): number {
    return this.validaciones.contar();
  }

  limpiar(): void {
    this.hablantes.limpiar();
    this.validaciones.limpiar();
  }
}
