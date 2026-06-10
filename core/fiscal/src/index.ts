import type { Result } from "better-result";

/**
 * Adapter fiscal do dfe-kit.
 *
 * Este modulo e o contrato unico que TODO package de provider implementa
 * (`FiscalProvider`), mais os tipos de dominio fiscal que ele carrega. Nao ha
 * runtime aqui: apenas tipos. Os schemas zod correspondentes vivem em
 * `@dfe-kit/fiscal/schemas`.
 *
 * Invariante central: rejeicao fiscal NAO e excecao tecnica. Ela chega como
 * `Result.ok` com `ProviderResponse.status === "rejected"` e `rejections[]`
 * preenchido. `Result.err(FiscalProviderError)` e reservado para falha
 * tecnica (transporte, parse, assinatura).
 */

export type FiscalDocumentKind = "nfe" | "nfce" | "nfse";

export type FiscalEnvironment = "homologation" | "production";

export type FiscalDocumentStatus =
  | "draft"
  | "queued"
  | "sending"
  | "accepted_pending_authorization"
  | "authorized"
  | "rejected"
  | "cancellation_queued"
  | "cancelled"
  | "technical_error_retryable"
  | "technical_error_terminal";

export type FiscalProviderCapability =
  | "issue_nfse"
  | "submit_rps_batch"
  | "submit_rps_batch_sync"
  | "query_rps_batch"
  | "query_nfse_by_rps"
  | "generate_nfse"
  | "query_issued_nfse"
  | "query_received_nfse"
  | "query_nfse_range"
  | "cancel_nfse"
  | "replace_nfse"
  | "issue_nfe"
  | "issue_nfce";

export type FiscalProviderCapabilityStatus =
  | "supported"
  | "unsupported"
  | "unverified_in_homologation";

export interface FiscalProviderCapabilityMetadata {
  readonly capability: FiscalProviderCapability;
  readonly status: FiscalProviderCapabilityStatus;
  readonly environments?: readonly FiscalEnvironment[];
  readonly reason?: string;
  readonly requiresSigner?: boolean;
  readonly requiresCertificateOutsideDFeKit?: boolean;
}

export interface FiscalProviderManifest {
  readonly id: string;
  readonly name: string;
  readonly documentKinds: readonly FiscalDocumentKind[];
  readonly environments: readonly FiscalEnvironment[];
  readonly capabilities: readonly FiscalProviderCapability[];
  readonly capabilityMetadata?: readonly FiscalProviderCapabilityMetadata[];
}

export interface FiscalAddress {
  readonly street: string;
  readonly number: string;
  readonly complement?: string;
  readonly district: string;
  readonly cityCode: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly countryCode: string;
}

export interface TaxParty {
  readonly legalName: string;
  readonly tradeName?: string;
  readonly cnpj?: string;
  readonly cpf?: string;
  readonly municipalRegistration?: string;
  readonly stateRegistration?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address: FiscalAddress;
}

export interface ServiceItem {
  readonly description: string;
  readonly serviceListCode: string;
  readonly municipalTaxCode?: string;
  readonly nbsCode?: string;
  readonly amount: string;
  readonly taxRate?: string;
  readonly taxable: boolean;
}

export interface FiscalDocumentRef {
  readonly documentKind: FiscalDocumentKind;
  readonly providerId: string;
  readonly environment: FiscalEnvironment;
  readonly issuerTaxId: string;
  readonly series: string;
  readonly number: string;
}

export interface FiscalArtifact {
  readonly kind: "request_xml" | "response_xml" | "authorized_xml" | "pdf" | "protocol";
  readonly mediaType: string;
  readonly bytes: Uint8Array;
}

export interface FiscalRejection {
  readonly code: string;
  readonly message: string;
  readonly correctionHint?: string;
}

export interface ProviderResponse {
  readonly status: FiscalDocumentStatus;
  readonly providerDocumentId?: string;
  readonly protocol?: string;
  readonly verificationUrl?: string;
  readonly rejections: readonly FiscalRejection[];
  readonly artifacts: readonly FiscalArtifact[];
}

export interface IssueFiscalDocumentInput {
  readonly environment: FiscalEnvironment;
  readonly documentKind: FiscalDocumentKind;
  readonly issuer: TaxParty;
  readonly customer: TaxParty;
  readonly services: readonly ServiceItem[];
  readonly series: string;
  readonly number: string;
  readonly issuedAt: string;
}

export interface IssueFiscalDocumentResponse {
  readonly documentRef: FiscalDocumentRef;
  readonly providerResponse: ProviderResponse;
}

export interface FiscalProviderError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
}

export interface FiscalProvider {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Promise<Result<IssueFiscalDocumentResponse, FiscalProviderError>>;
}
