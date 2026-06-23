import type { FiscalProviderCapabilityMetadata, FiscalProviderManifest } from "@dfe-kit/fiscal";
import { FiscalDocumentKindValue, FiscalEnvironmentValue } from "@dfe-kit/fiscal/schemas";
import {
  SAATRI_ABRASF_203_CAPABILITIES,
  SAATRI_ABRASF_203_CAPABILITY_METADATA,
  SAATRI_ABRASF_VERSION,
  saatriProviderPackageConfigSchema,
  type SaatriProviderPackageConfig,
} from "./config";

type ConfigureSaatriManifestInput = {
  readonly providerId: string;
  readonly providerName: string;
  readonly extraCapabilityMetadata?: readonly FiscalProviderCapabilityMetadata[] | undefined;
};

export const configureSaatriManifest = (
  input: ConfigureSaatriManifestInput,
): FiscalProviderManifest => ({
  id: input.providerId,
  name: input.providerName,
  documentKinds: [FiscalDocumentKindValue.nfse],
  environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
  capabilities: SAATRI_ABRASF_203_CAPABILITIES,
  capabilityMetadata: [
    ...SAATRI_ABRASF_203_CAPABILITY_METADATA,
    ...(input.extraCapabilityMetadata ?? []),
  ],
});

export { SAATRI_ABRASF_VERSION, saatriProviderPackageConfigSchema };
export type { SaatriProviderPackageConfig };
