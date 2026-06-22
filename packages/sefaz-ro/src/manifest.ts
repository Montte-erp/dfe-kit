import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_RO_STATE_CODE: SefazStateCode = "RO";

export const sefazRoManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_RO_STATE_CODE);
