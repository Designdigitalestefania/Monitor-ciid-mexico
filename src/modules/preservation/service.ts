import {
  registrarTransicion,
  type Expediente,
} from "../../domain/expediente.js";
import { registrarActor } from "../../domain/actor.js";
import {
  validarEtapaPreservable,
  validarYaPreservado,
  validarTieneTransiciones,
  validarTerritorioPreservable,
} from "./rules.js";
import {
  type PreservarInput,
  type RegistroPatrimonial,
  type ResultadoPreservacion,
} from "./types.js";

const VERSION_ACTUAL = "1.0.0";

/**
 * Servicio de preservacion.
 *
 * Convierte un expediente PUBLISHED en un registro patrimonial inmutable.
 * Ver ADR-003.
 */
export class PreservationService {
  private readonly registros: Map<string, RegistroPatrimonial> = new Map();

  /**
   * Preserva un expediente aprobado, generando su registro patrimonial.
   */
  preservar(input: PreservarInput): ResultadoPreservacion {
    const { expediente, actor } = input;

    const validaciones = [
      validarEtapaPreservable(expediente),
      validarYaPreservado(expediente),
      validarTieneTransiciones(expediente),
      validarTerritorioPreservable(expediente),
    ];

    for (const v of validaciones) {
      if (!v.exito) return v;
    }

    const actorRegistrado = registrarActor(actor);
    const ahora = new Date().toISOString();

    const expedientePreservado = registrarTransicion(expediente, {
      hasta: "PRESERVED",
      actor: actorRegistrado,
      razon: "Preservacion patrimonial",
    });

    const registro: RegistroPatrimonial = {
      expedienteId: expediente.id,
      tenantId: expediente.tenantId,
      preservadoEn: ahora,
      preservadoPor: actor.nombre,
      territorio: expediente.territorio,
      lenguas: expediente.lenguas,
      hashDocumental: this.generarHash(expediente, ahora),
      version: VERSION_ACTUAL,
      totalTransiciones: expedientePreservado.transiciones.length,
    };

    this.registros.set(expediente.id, registro);

    return {
      exito: true,
      expediente: expedientePreservado,
      registro,
    };
  }

  /**
   * Obtiene un registro patrimonial por ID de expediente.
   */
  obtenerRegistro(expedienteId: string): RegistroPatrimonial | null {
    return this.registros.get(expedienteId) ?? null;
  }

  /**
   * Lista todos los registros patrimoniales de un tenant.
   */
  listarPorTenant(tenantId: string): RegistroPatrimonial[] {
    return Array.from(this.registros.values()).filter(
      (r) => r.tenantId === tenantId
    );
  }

  /**
   * Cuenta los registros patrimoniales.
   */
  contar(): number {
    return this.registros.size;
  }

  /**
   * Limpia el almacen. Util para tests.
   */
  limpiar(): void {
    this.registros.clear();
  }

  /**
   * Genera un hash documental determinista a partir del expediente.
   * No es criptografico, es un identificador de integridad simple.
   */
  private generarHash(expediente: Expediente, timestamp: string): string {
    const base = [
      expediente.id,
      expediente.idInterno,
      expediente.tenantId,
      expediente.territorio.estado,
      expediente.transiciones.length.toString(),
      timestamp,
    ].join("|");

    let h = 0;
    for (let i = 0; i < base.length; i++) {
      h = (h << 5) - h + base.charCodeAt(i);
      h = h & h;
    }
    const hex = Math.abs(h).toString(16).padStart(8, "0");
    return "sha-local-" + hex;
  }
}

export type { Expediente };
