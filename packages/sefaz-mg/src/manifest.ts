import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_MG_STATE_CODE: SefazStateCode = "MG";

export const sefazMgManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_MG_STATE_CODE);
