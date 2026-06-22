import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_AM_STATE_CODE: SefazStateCode = "AM";

export const sefazAmManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_AM_STATE_CODE);
