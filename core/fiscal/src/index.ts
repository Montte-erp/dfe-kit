import { Context, type Effect } from "effect";
import {
  fiscalAddressSchema,
  fiscalArtifactKindSchema,
  fiscalArtifactSchema,
  fiscalDocumentKindSchema,
  fiscalDocumentRefSchema,
  fiscalDocumentStatusSchema,
  fiscalEnvironmentSchema,
  fiscalProviderCapabilityMetadataSchema,
  fiscalProviderCapabilitySchema,
  fiscalProviderCapabilityStatusSchema,
  fiscalProviderManifestSchema,
  fiscalProviderErrorSchema,
  fiscalRejectionSchema,
  issueFiscalDocumentInputSchema,
  issueFiscalDocumentResponseSchema,
  providerResponseSchema,
  productItemSchema,
  serviceItemSchema,
  taxPartySchema,
} from "./schemas";
export {
  brazilianStateCodeSchema,
  brazilianTaxIdSchema,
  cnpjSchema,
  cpfSchema,
  fiscalMoneySchema,
  fiscalTaxRateSchema,
  fiscalArtifactKindSchema,
  FiscalArtifactKindValue,
  FiscalDocumentKindValue,
  FiscalDocumentStatusValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
  ibgeCityCodeSchema,
  postalCodeSchema,
} from "./schemas";
export type {
  BrazilianStateCode,
  BrazilianTaxId,
  Cnpj,
  Cpf,
  FiscalMoney,
  FiscalTaxRate,
  IbgeCityCode,
  PostalCode,
} from "./schemas";

/**
 * Adapter fiscal do dfe-kit.
 *
 * Este modulo e o contrato unico que TODO package de provider implementa
 * (`FiscalProvider`), mais os tipos de dominio fiscal que ele carrega. Schemas
 * Effect correspondentes vivem em `@dfe-kit/fiscal/schemas`.
 *
 * Invariante central: rejeicao fiscal NAO e excecao tecnica. Ela chega no canal
 * de sucesso do Effect com `ProviderResponse.status === "rejected"` e
 * `rejections[]` preenchido. O canal de erro do Effect e reservado para falha
 * tecnica recuperavel (transporte, parse, assinatura).
 */

export type FiscalDocumentKind = (typeof fiscalDocumentKindSchema)["Type"];

export type FiscalEnvironment = (typeof fiscalEnvironmentSchema)["Type"];

export type FiscalDocumentStatus = (typeof fiscalDocumentStatusSchema)["Type"];

export type FiscalProviderCapability = (typeof fiscalProviderCapabilitySchema)["Type"];

export type FiscalProviderCapabilityStatus = (typeof fiscalProviderCapabilityStatusSchema)["Type"];

export type FiscalProviderCapabilityMetadata =
  (typeof fiscalProviderCapabilityMetadataSchema)["Type"];

export type FiscalProviderManifest = (typeof fiscalProviderManifestSchema)["Type"];

export type FiscalAddress = (typeof fiscalAddressSchema)["Type"];

export type TaxParty = (typeof taxPartySchema)["Type"];

export type ServiceItem = (typeof serviceItemSchema)["Type"];
export type ProductItem = (typeof productItemSchema)["Type"];

export type FiscalDocumentRef = (typeof fiscalDocumentRefSchema)["Type"];

export type FiscalArtifactKind = (typeof fiscalArtifactKindSchema)["Type"];

export type FiscalArtifact = (typeof fiscalArtifactSchema)["Type"];

export type FiscalRejection = (typeof fiscalRejectionSchema)["Type"];

export type ProviderResponse = (typeof providerResponseSchema)["Type"];

export type IssueFiscalDocumentInput = (typeof issueFiscalDocumentInputSchema)["Type"];

export type IssueFiscalDocumentResponse = (typeof issueFiscalDocumentResponseSchema)["Type"];

export type FiscalProviderError = (typeof fiscalProviderErrorSchema)["Type"];

export type FiscalProvider = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, FiscalProviderError>;
};

export const FiscalProviderService: Context.Service<FiscalProvider, FiscalProvider> =
  Context.Service<FiscalProvider>("dfe-kit/fiscal/FiscalProvider");
