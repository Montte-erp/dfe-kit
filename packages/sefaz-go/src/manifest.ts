import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_GO_STATE_CODE: SefazStateCode = "GO";

export const sefazGoManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_GO_STATE_CODE);
