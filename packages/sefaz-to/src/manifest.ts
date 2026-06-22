import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_TO_STATE_CODE: SefazStateCode = "TO";

export const sefazToManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_TO_STATE_CODE);
