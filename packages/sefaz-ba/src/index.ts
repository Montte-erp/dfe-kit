import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_BA_STATE_CODE: SefazStateCode = "BA";

export const sefazBaManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_BA_STATE_CODE);
