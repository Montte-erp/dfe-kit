import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_CE_STATE_CODE: SefazStateCode = "CE";

export const sefazCeManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_CE_STATE_CODE);
