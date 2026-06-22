import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_SE_STATE_CODE: SefazStateCode = "SE";

export const sefazSeManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_SE_STATE_CODE);
