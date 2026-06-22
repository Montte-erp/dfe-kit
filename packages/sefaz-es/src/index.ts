import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_ES_STATE_CODE: SefazStateCode = "ES";

export const sefazEsManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_ES_STATE_CODE);
