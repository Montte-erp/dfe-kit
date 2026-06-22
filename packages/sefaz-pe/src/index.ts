import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_PE_STATE_CODE: SefazStateCode = "PE";

export const sefazPeManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_PE_STATE_CODE);
