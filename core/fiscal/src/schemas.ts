import { Effect, Schema, type Brand } from "effect";
import { isValidBrazilianTaxId, isValidCnpj, isValidCpf } from "./brazilian-tax-id";

const nonEmptyString: Schema.Codec<string, unknown> = Schema.NonEmptyString;
const cityCode: Schema.Codec<string, unknown> = Schema.String.check(Schema.isPattern(/^\d{7}$/));
const postalCode: Schema.Codec<string, unknown> = Schema.String.check(Schema.isPattern(/^\d{8}$/));
const money: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.isPattern(/^\d+(\.\d{2})$/),
);
const taxRate: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.isPattern(/^\d+(\.\d{2,4})$/),
);
const isoDateTime: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}T.+/),
);
const urlString: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.isPattern(/^https?:\/\/.+/),
);
const emailString: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
);

export type IbgeCityCode = Brand.Branded<string, "IbgeCityCode">;
export const ibgeCityCodeSchema: Schema.Codec<IbgeCityCode, unknown> = Schema.String.check(
  Schema.isPattern(/^\d{7}$/),
).pipe(Schema.brand("IbgeCityCode"));

export type PostalCode = Brand.Branded<string, "PostalCode">;
export const postalCodeSchema: Schema.Codec<PostalCode, unknown> = Schema.String.check(
  Schema.isPattern(/^\d{8}$/),
).pipe(Schema.brand("PostalCode"));

export type FiscalMoney = Brand.Branded<string, "FiscalMoney">;
export const fiscalMoneySchema: Schema.Codec<FiscalMoney, unknown> = Schema.String.check(
  Schema.isPattern(/^\d+(\.\d{2})$/),
).pipe(Schema.brand("FiscalMoney"));

export type FiscalTaxRate = Brand.Branded<string, "FiscalTaxRate">;
export const fiscalTaxRateSchema: Schema.Codec<FiscalTaxRate, unknown> = Schema.String.check(
  Schema.isPattern(/^\d+(\.\d{2,4})$/),
).pipe(Schema.brand("FiscalTaxRate"));

export type Cpf = Brand.Branded<string, "Cpf">;
export const cpfSchema: Schema.Codec<Cpf, unknown> = Schema.String.check(
  Schema.makeFilter(isValidCpf, { expected: "a valid CPF" }),
).pipe(Schema.brand("Cpf"));

export type Cnpj = Brand.Branded<string, "Cnpj">;
export const cnpjSchema: Schema.Codec<Cnpj, unknown> = Schema.String.check(
  Schema.makeFilter(isValidCnpj, { expected: "a valid CNPJ" }),
).pipe(Schema.brand("Cnpj"));

export type BrazilianTaxId = Brand.Branded<string, "BrazilianTaxId">;
export const brazilianTaxIdSchema: Schema.Codec<BrazilianTaxId, unknown> = Schema.String.check(
  Schema.makeFilter(isValidBrazilianTaxId, { expected: "a valid CPF or CNPJ" }),
).pipe(Schema.brand("BrazilianTaxId"));

const validCpf: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.makeFilter(isValidCpf, { expected: "a valid CPF" }),
);
const validCnpj: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.makeFilter(isValidCnpj, { expected: "a valid CNPJ" }),
);
const validBrazilianTaxId: Schema.Codec<string, unknown> = Schema.String.check(
  Schema.makeFilter(isValidBrazilianTaxId, { expected: "a valid CPF or CNPJ" }),
);

export type BrazilianStateCode =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";
export const brazilianStateCodeSchema: Schema.Codec<BrazilianStateCode, unknown> = Schema.Literals([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

export type FiscalDocumentKindValue = "nfe" | "nfce" | "nfse";
export const fiscalDocumentKindSchema: Schema.Codec<FiscalDocumentKindValue, unknown> =
  Schema.Literals(["nfe", "nfce", "nfse"]);
export const FiscalDocumentKindValue = {
  nfe: "nfe",
  nfce: "nfce",
  nfse: "nfse",
} satisfies Record<string, FiscalDocumentKindValue>;

export type FiscalEnvironmentValue = "homologation" | "production";
export const fiscalEnvironmentSchema: Schema.Codec<FiscalEnvironmentValue, unknown> =
  Schema.Literals(["homologation", "production"]);
export const FiscalEnvironmentValue = {
  homologation: "homologation",
  production: "production",
} satisfies Record<string, FiscalEnvironmentValue>;

export type FiscalDocumentStatusValue =
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
export const fiscalDocumentStatusSchema: Schema.Codec<FiscalDocumentStatusValue, unknown> =
  Schema.Literals([
    "draft",
    "queued",
    "sending",
    "accepted_pending_authorization",
    "authorized",
    "rejected",
    "cancellation_queued",
    "cancelled",
    "technical_error_retryable",
    "technical_error_terminal",
  ]);
export const FiscalDocumentStatusValue = {
  draft: "draft",
  queued: "queued",
  sending: "sending",
  acceptedPendingAuthorization: "accepted_pending_authorization",
  authorized: "authorized",
  rejected: "rejected",
  cancellationQueued: "cancellation_queued",
  cancelled: "cancelled",
  technicalErrorRetryable: "technical_error_retryable",
  technicalErrorTerminal: "technical_error_terminal",
} satisfies Record<string, FiscalDocumentStatusValue>;

export type FiscalProviderCapabilityValue =
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
export const fiscalProviderCapabilitySchema: Schema.Codec<FiscalProviderCapabilityValue, unknown> =
  Schema.Literals([
    "issue_nfse",
    "submit_rps_batch",
    "submit_rps_batch_sync",
    "query_rps_batch",
    "query_nfse_by_rps",
    "generate_nfse",
    "query_issued_nfse",
    "query_received_nfse",
    "query_nfse_range",
    "cancel_nfse",
    "replace_nfse",
    "issue_nfe",
    "issue_nfce",
  ]);
export const FiscalProviderCapabilityValue = {
  issueNfse: "issue_nfse",
  submitRpsBatch: "submit_rps_batch",
  submitRpsBatchSync: "submit_rps_batch_sync",
  queryRpsBatch: "query_rps_batch",
  queryNfseByRps: "query_nfse_by_rps",
  generateNfse: "generate_nfse",
  queryIssuedNfse: "query_issued_nfse",
  queryReceivedNfse: "query_received_nfse",
  queryNfseRange: "query_nfse_range",
  cancelNfse: "cancel_nfse",
  replaceNfse: "replace_nfse",
  issueNfe: "issue_nfe",
  issueNfce: "issue_nfce",
} satisfies Record<string, FiscalProviderCapabilityValue>;

export type FiscalProviderCapabilityStatusValue =
  | "supported"
  | "unsupported"
  | "unverified_in_homologation";
export const fiscalProviderCapabilityStatusSchema: Schema.Codec<
  FiscalProviderCapabilityStatusValue,
  unknown
> = Schema.Literals(["supported", "unsupported", "unverified_in_homologation"]);
export const FiscalProviderCapabilityStatusValue = {
  supported: "supported",
  unsupported: "unsupported",
  unverifiedInHomologation: "unverified_in_homologation",
} satisfies Record<string, FiscalProviderCapabilityStatusValue>;

export type FiscalProviderCapabilityMetadata = {
  readonly capability: FiscalProviderCapabilityValue;
  readonly status: FiscalProviderCapabilityStatusValue;
  readonly environments?: readonly FiscalEnvironmentValue[] | undefined;
  readonly reason?: string | undefined;
  readonly requiresSigner?: boolean | undefined;
  readonly requiresCertificateOutsideDFeKit?: boolean | undefined;
};
export const fiscalProviderCapabilityMetadataSchema: Schema.Codec<
  FiscalProviderCapabilityMetadata,
  unknown
> = Schema.Struct({
  capability: fiscalProviderCapabilitySchema,
  status: fiscalProviderCapabilityStatusSchema,
  environments: Schema.optional(Schema.Array(fiscalEnvironmentSchema)),
  reason: Schema.optional(Schema.String),
  requiresSigner: Schema.optional(Schema.Boolean),
  requiresCertificateOutsideDFeKit: Schema.optional(Schema.Boolean),
});

export type FiscalProviderManifest = {
  readonly id: string;
  readonly name: string;
  readonly documentKinds: readonly FiscalDocumentKindValue[];
  readonly environments: readonly FiscalEnvironmentValue[];
  readonly capabilities: readonly FiscalProviderCapabilityValue[];
  readonly capabilityMetadata?: readonly FiscalProviderCapabilityMetadata[] | undefined;
};
export const fiscalProviderManifestSchema: Schema.Codec<FiscalProviderManifest, unknown> =
  Schema.Struct({
    id: nonEmptyString,
    name: nonEmptyString,
    documentKinds: Schema.Array(fiscalDocumentKindSchema).check(Schema.isMinLength(1)),
    environments: Schema.Array(fiscalEnvironmentSchema).check(Schema.isMinLength(1)),
    capabilities: Schema.Array(fiscalProviderCapabilitySchema),
    capabilityMetadata: Schema.optional(Schema.Array(fiscalProviderCapabilityMetadataSchema)),
  });

export type FiscalAddress = {
  readonly street: string;
  readonly number: string;
  readonly complement?: string | undefined;
  readonly district: string;
  readonly cityCode: string;
  readonly city: string;
  readonly state: BrazilianStateCode;
  readonly postalCode: string;
  readonly countryCode: string;
};
export const fiscalAddressSchema: Schema.Codec<FiscalAddress, unknown> = Schema.Struct({
  street: nonEmptyString,
  number: nonEmptyString,
  complement: Schema.optional(Schema.String),
  district: nonEmptyString,
  cityCode,
  city: nonEmptyString,
  state: brazilianStateCodeSchema,
  postalCode,
  countryCode: Schema.String.pipe(Schema.withDecodingDefaultKey(Effect.succeed("1058"))),
});

export type TaxParty = {
  readonly legalName: string;
  readonly tradeName?: string | undefined;
  readonly cnpj?: string | undefined;
  readonly cpf?: string | undefined;
  readonly municipalRegistration?: string | undefined;
  readonly stateRegistration?: string | undefined;
  readonly email?: string | undefined;
  readonly phone?: string | undefined;
  readonly address: FiscalAddress;
};
export const taxPartySchema: Schema.Codec<TaxParty, unknown> = Schema.Struct({
  legalName: nonEmptyString,
  tradeName: Schema.optional(Schema.String),
  cnpj: Schema.optional(validCnpj),
  cpf: Schema.optional(validCpf),
  municipalRegistration: Schema.optional(Schema.String),
  stateRegistration: Schema.optional(Schema.String),
  email: Schema.optional(emailString),
  phone: Schema.optional(Schema.String),
  address: fiscalAddressSchema,
}).check(
  Schema.makeFilter((party) => party.cnpj !== undefined || party.cpf !== undefined, {
    expected: "Parte fiscal deve informar CNPJ ou CPF.",
  }),
);

export type ServiceItem = {
  readonly description: string;
  readonly serviceListCode: string;
  readonly municipalTaxCode?: string | undefined;
  readonly nbsCode?: string | undefined;
  readonly amount: string;
  readonly taxRate?: string | undefined;
  readonly taxable: boolean;
};
export const serviceItemSchema: Schema.Codec<ServiceItem, unknown> = Schema.Struct({
  description: nonEmptyString,
  serviceListCode: nonEmptyString,
  municipalTaxCode: Schema.optional(Schema.String),
  nbsCode: Schema.optional(Schema.String),
  amount: money,
  taxRate: Schema.optional(taxRate),
  taxable: Schema.Boolean,
});

export type ProductItem = {
  readonly description: string;
  readonly cfop: string;
  readonly ncm: string;
  readonly quantity: string;
  readonly unit: string;
  readonly unitAmount: string;
  readonly totalAmount: string;
  readonly taxable: boolean;
};
export const productItemSchema: Schema.Codec<ProductItem, unknown> = Schema.Struct({
  description: nonEmptyString,
  cfop: Schema.String.check(Schema.isPattern(/^\d{4}$/)),
  ncm: Schema.String.check(Schema.isPattern(/^\d{8}$/)),
  quantity: Schema.String.check(Schema.isPattern(/^\d+(\.\d{1,4})?$/)),
  unit: nonEmptyString,
  unitAmount: money,
  totalAmount: money,
  taxable: Schema.Boolean,
});

export type FiscalDocumentRef = {
  readonly documentKind: FiscalDocumentKindValue;
  readonly providerId: string;
  readonly environment: FiscalEnvironmentValue;
  readonly issuerTaxId: string;
  readonly series: string;
  readonly number: string;
};
export const fiscalDocumentRefSchema: Schema.Codec<FiscalDocumentRef, unknown> = Schema.Struct({
  documentKind: fiscalDocumentKindSchema,
  providerId: nonEmptyString,
  environment: fiscalEnvironmentSchema,
  issuerTaxId: validBrazilianTaxId,
  series: nonEmptyString,
  number: nonEmptyString,
});

const uint8ArraySchema: Schema.Codec<Uint8Array, unknown> = Schema.Uint8Array;
export type FiscalArtifactKindValue =
  | "request_xml"
  | "response_xml"
  | "authorized_xml"
  | "pdf"
  | "protocol";
export const fiscalArtifactKindSchema: Schema.Codec<FiscalArtifactKindValue, unknown> =
  Schema.Literals(["request_xml", "response_xml", "authorized_xml", "pdf", "protocol"]);
export const FiscalArtifactKindValue = {
  requestXml: "request_xml",
  responseXml: "response_xml",
  authorizedXml: "authorized_xml",
  pdf: "pdf",
  protocol: "protocol",
} satisfies Record<string, FiscalArtifactKindValue>;

export type FiscalArtifact = {
  readonly kind: FiscalArtifactKindValue;
  readonly mediaType: string;
  readonly bytes: Uint8Array;
};
export const fiscalArtifactSchema: Schema.Codec<FiscalArtifact, unknown> = Schema.Struct({
  kind: fiscalArtifactKindSchema,
  mediaType: nonEmptyString,
  bytes: uint8ArraySchema,
});

export type FiscalRejection = {
  readonly code: string;
  readonly message: string;
  readonly correctionHint?: string | undefined;
};
export const fiscalRejectionSchema: Schema.Codec<FiscalRejection, unknown> = Schema.Struct({
  code: nonEmptyString,
  message: nonEmptyString,
  correctionHint: Schema.optional(Schema.String),
});

export type ProviderResponse = {
  readonly status: FiscalDocumentStatusValue;
  readonly providerDocumentId?: string | undefined;
  readonly protocol?: string | undefined;
  readonly verificationUrl?: string | undefined;
  readonly rejections: readonly FiscalRejection[];
  readonly artifacts: readonly FiscalArtifact[];
};
export const providerResponseSchema: Schema.Codec<ProviderResponse, unknown> = Schema.Struct({
  status: fiscalDocumentStatusSchema,
  providerDocumentId: Schema.optional(Schema.String),
  protocol: Schema.optional(Schema.String),
  verificationUrl: Schema.optional(urlString),
  rejections: Schema.Array(fiscalRejectionSchema),
  artifacts: Schema.Array(fiscalArtifactSchema),
});

export type IssueFiscalDocumentResponse = {
  readonly documentRef: FiscalDocumentRef;
  readonly providerResponse: ProviderResponse;
};
export const issueFiscalDocumentResponseSchema: Schema.Codec<IssueFiscalDocumentResponse, unknown> =
  Schema.Struct({
    documentRef: fiscalDocumentRefSchema,
    providerResponse: providerResponseSchema,
  });

export type FiscalProviderError = {
  readonly code: string;
  readonly retryable: boolean;
  readonly message: string;
};
export const fiscalProviderErrorSchema: Schema.Codec<FiscalProviderError, unknown> = Schema.Struct({
  code: Schema.String,
  retryable: Schema.Boolean,
  message: Schema.String,
});

export type IssueFiscalDocumentInput = {
  readonly environment: FiscalEnvironmentValue;
  readonly documentKind: FiscalDocumentKindValue;
  readonly issuer: TaxParty;
  readonly customer: TaxParty;
  readonly services?: readonly ServiceItem[] | undefined;
  readonly products?: readonly ProductItem[] | undefined;
  readonly series: string;
  readonly number: string;
  readonly issuedAt: string;
};
export const issueFiscalDocumentInputSchema: Schema.Codec<IssueFiscalDocumentInput, unknown> =
  Schema.Struct({
    environment: fiscalEnvironmentSchema,
    documentKind: fiscalDocumentKindSchema,
    issuer: taxPartySchema,
    customer: taxPartySchema,
    services: Schema.optional(Schema.Array(serviceItemSchema).check(Schema.isMinLength(1))),
    products: Schema.optional(Schema.Array(productItemSchema).check(Schema.isMinLength(1))),
    series: nonEmptyString,
    number: nonEmptyString,
    issuedAt: isoDateTime,
  }).check(
    Schema.makeFilter(
      (input) =>
        input.documentKind === FiscalDocumentKindValue.nfse
          ? input.services !== undefined
          : input.products !== undefined,
      {
        expected: "NFS-e deve informar services[]; NF-e/NFC-e devem informar products[].",
      },
    ),
  );
