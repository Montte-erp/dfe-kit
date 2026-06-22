import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SefazStateCode } from "@dfe-kit/adapter-sefaz/catalog";
import { createSefazStateManifest } from "@dfe-kit/adapter-sefaz/catalog";

export const SEFAZ_PI_STATE_CODE: SefazStateCode = "PI";

export const sefazPiManifest: FiscalProviderManifest =
  createSefazStateManifest(SEFAZ_PI_STATE_CODE);
