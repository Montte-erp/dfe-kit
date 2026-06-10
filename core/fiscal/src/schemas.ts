import { isValidBrazilianTaxId, isValidCnpj, isValidCpf } from "@dfe-kit/utils";
import { z } from "zod";

export const fiscalDocumentKindSchema = z.enum(["nfe", "nfce", "nfse"]);
export const fiscalEnvironmentSchema = z.enum(["homologation", "production"]);
export const fiscalDocumentStatusSchema = z.enum([
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

export const fiscalProviderCapabilitySchema = z.enum([
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

export const fiscalProviderCapabilityStatusSchema = z.enum([
  "supported",
  "unsupported",
  "unverified_in_homologation",
]);

export const fiscalProviderCapabilityMetadataSchema = z.object({
  capability: fiscalProviderCapabilitySchema,
  status: fiscalProviderCapabilityStatusSchema,
  environments: z.array(fiscalEnvironmentSchema).optional(),
  reason: z.string().optional(),
  requiresSigner: z.boolean().optional(),
  requiresCertificateOutsideDFeKit: z.boolean().optional(),
});

export const fiscalProviderManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  documentKinds: z.array(fiscalDocumentKindSchema).min(1),
  environments: z.array(fiscalEnvironmentSchema).min(1),
  capabilities: z.array(fiscalProviderCapabilitySchema),
  capabilityMetadata: z.array(fiscalProviderCapabilityMetadataSchema).optional(),
});

export const fiscalAddressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  district: z.string().min(1),
  cityCode: z.string().regex(/^\d{7}$/),
  city: z.string().min(1),
  state: z.string().regex(/^[A-Z]{2}$/),
  postalCode: z.string().regex(/^\d{8}$/),
  countryCode: z.string().default("1058"),
});

export const taxPartySchema = z
  .object({
    legalName: z.string().min(1),
    tradeName: z.string().optional(),
    cnpj: z.string().refine(isValidCnpj, { message: "CNPJ must be valid." }).optional(),
    cpf: z.string().refine(isValidCpf, { message: "CPF must be valid." }).optional(),
    municipalRegistration: z.string().optional(),
    stateRegistration: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    address: fiscalAddressSchema,
  })
  .refine((party) => party.cnpj !== undefined || party.cpf !== undefined, {
    message: "Parte fiscal deve informar CNPJ ou CPF.",
  });

export const serviceItemSchema = z.object({
  description: z.string().min(1),
  serviceListCode: z.string().min(1),
  municipalTaxCode: z.string().optional(),
  nbsCode: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{2})$/),
  taxRate: z
    .string()
    .regex(/^\d+(\.\d{2,4})$/)
    .optional(),
  taxable: z.boolean(),
});

export const fiscalDocumentRefSchema = z.object({
  documentKind: fiscalDocumentKindSchema,
  providerId: z.string().min(1),
  environment: fiscalEnvironmentSchema,
  issuerTaxId: z.string().refine(isValidBrazilianTaxId, {
    message: "Issuer tax id must be a valid CPF or CNPJ.",
  }),
  series: z.string().min(1),
  number: z.string().min(1),
});

const uint8ArraySchema = z.custom<Uint8Array>(
  (value) => Object.prototype.toString.call(value) === "[object Uint8Array]",
  { message: "Esperado Uint8Array." },
);

export const fiscalArtifactSchema = z.object({
  kind: z.enum(["request_xml", "response_xml", "authorized_xml", "pdf", "protocol"]),
  mediaType: z.string().min(1),
  bytes: uint8ArraySchema,
});

export const fiscalRejectionSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  correctionHint: z.string().optional(),
});

export const providerResponseSchema = z.object({
  status: fiscalDocumentStatusSchema,
  providerDocumentId: z.string().optional(),
  protocol: z.string().optional(),
  verificationUrl: z.url().optional(),
  rejections: z.array(fiscalRejectionSchema),
  artifacts: z.array(fiscalArtifactSchema),
});

export const issueFiscalDocumentInputSchema = z.object({
  environment: fiscalEnvironmentSchema,
  documentKind: fiscalDocumentKindSchema,
  issuer: taxPartySchema,
  customer: taxPartySchema,
  services: z.array(serviceItemSchema).min(1),
  series: z.string().min(1),
  number: z.string().min(1),
  issuedAt: z.string().datetime(),
});
