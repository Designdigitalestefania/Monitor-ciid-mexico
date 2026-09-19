import {
  registrarTransicion,
  type Expediente,
} from "../../domain/expediente.js";
import { registrarActor } from "../../domain/actor.js";
import { type Repository } from "../../persistence/types.js";
import { InMemoryRepository } from "../../persistence/in-memory.js";
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
  constructor(
    private readonly repo: Repository<RegistroPatrimonial> =
      new InMemoryRepository<RegistroPatrimonial>()
  ) {}

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
      id: expediente.id,
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

    this.repo.guardar(registro);

    return {
      exito: true,
      expediente: expedientePreservado,
      registro,
    };
  }

  obtenerRegistro(expedienteId: string): RegistroPatrimonial | null {
    return this.repo.obtener(expedienteId);
  }

  listarPorTenant(tenantId: string): RegistroPatrimonial[] {
    return this.repo.listar().filter((r) => r.tenantId === tenantId);
  }

  contar(): number {
    return this.repo.contar();
  }

  limpiar(): void {
    this.repo.limpiar();
  }

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
