import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_RS_STATE_CODE: SefazStateCode = "RS";

export const sefazRsManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_RS_STATE_CODE);
