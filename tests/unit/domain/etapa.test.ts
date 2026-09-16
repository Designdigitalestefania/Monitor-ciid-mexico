import { describe, it, expect } from "vitest";
import {
  ETAPAS,
  siguienteEtapa,
  validarTransicion,
  validarDevolucion,
  validarRechazo,
  esTerminal,
} from "../../../src/domain/etapa.js";

describe("Etapa", () => {
  it("tiene 8 etapas", () => {
    expect(ETAPAS.length).toBe(8);
  });
  it("inicia en RECEIVED", () => {
    expect(ETAPAS[0]).toBe("RECEIVED");
  });
  it("termina en PRESERVED", () => {
    expect(ETAPAS[ETAPAS.length - 1]).toBe("PRESERVED");
  });
  it("avanza una a la vez", () => {
    expect(siguienteEtapa("RECEIVED")).toBe("PROCESSING");
    expect(siguienteEtapa("PRESERVED")).toBeNull();
  });
  it("rechaza saltos", () => {
    expect(validarTransicion("VERIFICATION", "PUBLISHED").valida).toBe(false);
  });
  it("requiere actor humano en DECISION", () => {
    expect(validarTransicion("VERIFICATION", "DECISION", false).valida).toBe(false);
    expect(validarTransicion("VERIFICATION", "DECISION", true).valida).toBe(true);
  });
  it("devuelve solo desde DECISION", () => {
    expect(validarDevolucion("DECISION").valida).toBe(true);
    expect(validarDevolucion("VERIFICATION").valida).toBe(false);
  });
  it("rechaza desde VERIFICATION o DECISION", () => {
    expect(validarRechazo("VERIFICATION").valida).toBe(true);
    expect(validarRechazo("DECISION").valida).toBe(true);
    expect(validarRechazo("RECEIVED").valida).toBe(false);
  });
  it("identifica terminales", () => {
    expect(esTerminal("PRESERVED")).toBe(true);
    expect(esTerminal("REJECTED")).toBe(true);
    expect(esTerminal("DECISION")).toBe(false);
  });
});
