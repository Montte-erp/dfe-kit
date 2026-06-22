import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_AL_STATE_CODE: SefazStateCode = "AL";

export const sefazAlManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_AL_STATE_CODE);
