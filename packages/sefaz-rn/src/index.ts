import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_RN_STATE_CODE: SefazStateCode = "RN";

export const sefazRnManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_RN_STATE_CODE);
