import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_MS_STATE_CODE: SefazStateCode = "MS";

export const sefazMsManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_MS_STATE_CODE);
