import { Effect, Schema, type Brand } from "effect";
import { isValidBrazilianTaxId, isValidCnpj, isValidCpf } from "./brazilian-tax-id";

const defineFiscalSchema = <T>(schema: Schema.Decoder<T>): Schema.Decoder<T> => schema;

const nonEmptyString: Schema.Decoder<string> = Schema.NonEmptyString;
const cityCode: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^\d{7}$/));
const postalCode: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^\d{8}$/));
const money: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^\d+(\.\d{2})$/));
const taxRate: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^\d+(\.\d{2,4})$/));
const isoDateTime: Schema.Decoder<string> = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}T.+/),
);
const urlString: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^https?:\/\/.+/));
const emailString: Schema.Decoder<string> = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
);

export type IbgeCityCode = Brand.Branded<string, "IbgeCityCode">;
export const ibgeCityCodeSchema: Schema.Decoder<IbgeCityCode> = defineFiscalSchema<IbgeCityCode>(
  Schema.String.check(Schema.isPattern(/^\d{7}$/)).pipe(Schema.brand("IbgeCityCode")),
);

export type PostalCode = Brand.Branded<string, "PostalCode">;
export const postalCodeSchema: Schema.Decoder<PostalCode> = defineFiscalSchema<PostalCode>(
  Schema.String.check(Schema.isPattern(/^\d{8}$/)).pipe(Schema.brand("PostalCode")),
);

export type FiscalMoney = Brand.Branded<string, "FiscalMoney">;
export const fiscalMoneySchema: Schema.Decoder<FiscalMoney> = defineFiscalSchema<FiscalMoney>(
  Schema.String.check(Schema.isPattern(/^\d+(\.\d{2})$/)).pipe(Schema.brand("FiscalMoney")),
);

export type FiscalTaxRate = Brand.Branded<string, "FiscalTaxRate">;
export const fiscalTaxRateSchema: Schema.Decoder<FiscalTaxRate> = defineFiscalSchema<FiscalTaxRate>(
  Schema.String.check(Schema.isPattern(/^\d+(\.\d{2,4})$/)).pipe(Schema.brand("FiscalTaxRate")),
);

export type Cpf = Brand.Branded<string, "Cpf">;
export const cpfSchema: Schema.Decoder<Cpf> = defineFiscalSchema<Cpf>(
  Schema.String.check(Schema.makeFilter(isValidCpf, { expected: "a valid CPF" })).pipe(
    Schema.brand("Cpf"),
  ),
);

export type Cnpj = Brand.Branded<string, "Cnpj">;
export const cnpjSchema: Schema.Decoder<Cnpj> = defineFiscalSchema<Cnpj>(
  Schema.String.check(Schema.makeFilter(isValidCnpj, { expected: "a valid CNPJ" })).pipe(
    Schema.brand("Cnpj"),
  ),
);

export type BrazilianTaxId = Brand.Branded<string, "BrazilianTaxId">;
export const brazilianTaxIdSchema: Schema.Decoder<BrazilianTaxId> =
  defineFiscalSchema<BrazilianTaxId>(
    Schema.String.check(
      Schema.makeFilter(isValidBrazilianTaxId, { expected: "a valid CPF or CNPJ" }),
    ).pipe(Schema.brand("BrazilianTaxId")),
  );

const validCpf: Schema.Decoder<string> = Schema.String.check(
  Schema.makeFilter(isValidCpf, { expected: "a valid CPF" }),
);
const validCnpj: Schema.Decoder<string> = Schema.String.check(
  Schema.makeFilter(isValidCnpj, { expected: "a valid CNPJ" }),
);
const validBrazilianTaxId: Schema.Decoder<string> = Schema.String.check(
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
export const brazilianStateCodeSchema: Schema.Decoder<BrazilianStateCode> = Schema.Literals([
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
export const fiscalDocumentKindSchema: Schema.Decoder<FiscalDocumentKindValue> = Schema.Literals([
  "nfe",
  "nfce",
  "nfse",
]);
export const FiscalDocumentKindValue = {
  nfe: "nfe",
  nfce: "nfce",
  nfse: "nfse",
} satisfies Record<string, FiscalDocumentKindValue>;

export type FiscalEnvironmentValue = "homologation" | "production";
export const fiscalEnvironmentSchema: Schema.Decoder<FiscalEnvironmentValue> = Schema.Literals([
  "homologation",
  "production",
]);
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
export const fiscalDocumentStatusSchema: Schema.Decoder<FiscalDocumentStatusValue> =
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
export const fiscalProviderCapabilitySchema: Schema.Decoder<FiscalProviderCapabilityValue> =
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
export const fiscalProviderCapabilityStatusSchema: Schema.Decoder<FiscalProviderCapabilityStatusValue> =
  Schema.Literals(["supported", "unsupported", "unverified_in_homologation"]);
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
export const fiscalProviderCapabilityMetadataSchema: Schema.Decoder<FiscalProviderCapabilityMetadata> =
  Schema.Struct({
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
export const fiscalProviderManifestSchema: Schema.Decoder<FiscalProviderManifest> = Schema.Struct({
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
export const fiscalAddressSchema: Schema.Decoder<FiscalAddress> = Schema.Struct({
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
export const taxPartySchema: Schema.Decoder<TaxParty> = Schema.Struct({
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
export const serviceItemSchema: Schema.Decoder<ServiceItem> = Schema.Struct({
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
export const productItemSchema: Schema.Decoder<ProductItem> = Schema.Struct({
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
export const fiscalDocumentRefSchema: Schema.Decoder<FiscalDocumentRef> = Schema.Struct({
  documentKind: fiscalDocumentKindSchema,
  providerId: nonEmptyString,
  environment: fiscalEnvironmentSchema,
  issuerTaxId: validBrazilianTaxId,
  series: nonEmptyString,
  number: nonEmptyString,
});

const uint8ArraySchema: Schema.Decoder<Uint8Array> = Schema.Uint8Array;
export type FiscalArtifactKindValue =
  | "request_xml"
  | "response_xml"
  | "authorized_xml"
  | "pdf"
  | "protocol";
export const fiscalArtifactKindSchema: Schema.Decoder<FiscalArtifactKindValue> = Schema.Literals([
  "request_xml",
  "response_xml",
  "authorized_xml",
  "pdf",
  "protocol",
]);
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
export const fiscalArtifactSchema: Schema.Decoder<FiscalArtifact> = Schema.Struct({
  kind: fiscalArtifactKindSchema,
  mediaType: nonEmptyString,
  bytes: uint8ArraySchema,
});

export type FiscalRejection = {
  readonly code: string;
  readonly message: string;
  readonly correctionHint?: string | undefined;
};
export const fiscalRejectionSchema: Schema.Decoder<FiscalRejection> = Schema.Struct({
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
export const providerResponseSchema: Schema.Decoder<ProviderResponse> = Schema.Struct({
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
export const issueFiscalDocumentResponseSchema: Schema.Decoder<IssueFiscalDocumentResponse> =
  Schema.Struct({
    documentRef: fiscalDocumentRefSchema,
    providerResponse: providerResponseSchema,
  });

export type FiscalProviderError = {
  readonly code: string;
  readonly retryable: boolean;
  readonly message: string;
};
export const fiscalProviderErrorSchema: Schema.Decoder<FiscalProviderError> = Schema.Struct({
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
export const issueFiscalDocumentInputSchema: Schema.Decoder<IssueFiscalDocumentInput> =
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
