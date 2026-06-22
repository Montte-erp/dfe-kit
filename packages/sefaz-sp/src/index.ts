import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_SP_STATE_CODE: SefazStateCode = "SP";

export const sefazSpManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_SP_STATE_CODE);
