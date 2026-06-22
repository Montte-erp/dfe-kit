import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_PB_STATE_CODE: SefazStateCode = "PB";

export const sefazPbManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_PB_STATE_CODE);
