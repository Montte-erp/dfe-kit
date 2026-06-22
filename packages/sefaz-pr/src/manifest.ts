import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_PR_STATE_CODE: SefazStateCode = "PR";

export const sefazPrManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_PR_STATE_CODE);
