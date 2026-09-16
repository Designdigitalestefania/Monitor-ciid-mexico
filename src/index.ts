export const CIID_VERSION = "0.1.0";

export interface CiidInfo {
  readonly name: string;
  readonly version: string;
  readonly motto: string;
  readonly principle: string;
}

export const ciid: CiidInfo = {
  name: "MONITOR CIID",
  version: CIID_VERSION,
  motto: "Innovar para informar. Digitalizar para preservar.",
  principle: "La tecnologia asiste. El periodista decide.",
};

export * from "./domain/index.js";
export * from "./modules/tenants/index.js";
export * from "./modules/ingest/index.js";
export * from "./modules/pipeline/index.js";
export * from "./modules/preservation/index.js";
export * from "./modules/citizen/index.js";
export * from "./modules/linguistic/index.js";
