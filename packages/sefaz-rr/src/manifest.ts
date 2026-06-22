import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_RR_STATE_CODE: SefazStateCode = "RR";

export const sefazRrManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_RR_STATE_CODE);
