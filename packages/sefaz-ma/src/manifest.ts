import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_MA_STATE_CODE: SefazStateCode = "MA";

export const sefazMaManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_MA_STATE_CODE);
