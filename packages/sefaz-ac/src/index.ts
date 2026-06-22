import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_AC_STATE_CODE: SefazStateCode = "AC";

export const sefazAcManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_AC_STATE_CODE);
