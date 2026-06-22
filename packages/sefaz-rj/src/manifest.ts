import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_RJ_STATE_CODE: SefazStateCode = "RJ";

export const sefazRjManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_RJ_STATE_CODE);
