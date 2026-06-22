import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_PA_STATE_CODE: SefazStateCode = "PA";

export const sefazPaManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_PA_STATE_CODE);
