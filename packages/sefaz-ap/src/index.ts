import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_AP_STATE_CODE: SefazStateCode = "AP";

export const sefazApManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_AP_STATE_CODE);
