import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_DF_STATE_CODE: SefazStateCode = "DF";

export const sefazDfManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_DF_STATE_CODE);
