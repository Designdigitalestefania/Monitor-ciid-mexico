import { LinguisticRepository } from "./repository.js";
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
    private readonly repo: LinguisticRepository = new LinguisticRepository()
  ) {}

  /**
   * Acredita un hablante nativo para una lengua y variante especifica.
   */
  acreditarHablante(input: AcreditarHablanteInput): ResultadoLinguistico {
    const validaciones = [
      validarIdHablante(input.id),
      validarAcreditacion(input),
    ];

    for (const v of validaciones) {
      if (!v.exito) return v;
    }

    if (this.repo.existeHablante(input.id)) {
      return {
        exito: false,
        razon: "Hablante ya acreditado: " + input.id,
      };
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

    this.repo.guardarHablante(hablante);

    return { exito: true, hablante };
  }

  /**
   * Registra una validacion linguistica en estado pendiente.
   */
  registrarValidacion(input: ValidarInput): ResultadoLinguistico {
    const validacionId = validarIdValidacion(input.id);
    if (!validacionId.exito) return validacionId;

    if (this.repo.existeValidacion(input.id)) {
      return {
        exito: false,
        razon: "Validacion ya existe: " + input.id,
      };
    }

    const hablante = this.repo.obtenerHablante(input.hablanteId);
    if (!hablante) {
      return {
        exito: false,
        razon: "Hablante no encontrado: " + input.hablanteId,
      };
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

    this.repo.guardarValidacion(nueva);

    return { exito: true, validacion: nueva };
  }

  /**
   * Aprueba una validacion en estado pendiente.
   */
  aprobarValidacion(id: string): ResultadoLinguistico {
    const validacion = this.repo.obtenerValidacion(id);
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

    this.repo.guardarValidacion(actualizada);

    return { exito: true, validacion: actualizada };
  }

  /**
   * Rechaza una validacion con motivo obligatorio.
   */
  rechazarValidacion(id: string, motivo: string): ResultadoLinguistico {
    const validacion = this.repo.obtenerValidacion(id);
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

    this.repo.guardarValidacion(actualizada);

    return { exito: true, validacion: actualizada };
  }

  obtenerValidacion(id: string): ValidacionLinguistica | null {
    return this.repo.obtenerValidacion(id);
  }

  obtenerHablante(id: string): Hablante | null {
    return this.repo.obtenerHablante(id);
  }

  listarHablantesPorTenant(tenantId: string): Hablante[] {
    return this.repo.listarHablantesPorTenant(tenantId);
  }

  listarValidacionesPorExpediente(expedienteId: string): ValidacionLinguistica[] {
    return this.repo.listarValidacionesPorExpediente(expedienteId);
  }

  filtrar(filtros: FiltrosValidacion): ValidacionLinguistica[] {
    return this.repo.listarValidaciones().filter((v) => {
      if (filtros.tenantId && v.tenantId !== filtros.tenantId) return false;
      if (filtros.expedienteId && v.expedienteId !== filtros.expedienteId) {
        return false;
      }
      if (filtros.estado && v.estado !== filtros.estado) return false;
      if (filtros.hablanteId && v.hablanteId !== filtros.hablanteId) {
        return false;
      }
      return true;
    });
  }

  contarHablantes(): number {
    return this.repo.contarHablantes();
  }

  contarValidaciones(): number {
    return this.repo.contarValidaciones();
  }

  limpiar(): void {
    this.repo.limpiar();
  }
}
