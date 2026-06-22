import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_SC_STATE_CODE: SefazStateCode = "SC";

export const sefazScManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_SC_STATE_CODE);
