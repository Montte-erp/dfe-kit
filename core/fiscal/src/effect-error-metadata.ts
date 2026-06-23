import { Schema, type SchemaIssue } from "effect";

export type SchemaIssueMetadata = {
  readonly issuePath?: string | undefined;
  readonly issueMessage: string;
  readonly upstreamTag: string;
};

export const schemaIssueMetadataSchema: Schema.Codec<SchemaIssueMetadata, unknown> = Schema.Struct({
  issuePath: Schema.optional(Schema.String),
  issueMessage: Schema.String,
  upstreamTag: Schema.String,
});

const formatIssuePath = (path: ReadonlyArray<PropertyKey>): string | undefined =>
  path.length === 0 ? undefined : path.map((segment) => String(segment)).join(".");

const schemaIssueLeafMetadata = (
  issue: SchemaIssue.Issue,
  path: ReadonlyArray<PropertyKey> = [],
): SchemaIssueMetadata => {
  switch (issue._tag) {
    case "Pointer":
      return schemaIssueLeafMetadata(issue.issue, [...path, ...issue.path]);
    case "Composite":
      return schemaIssueLeafMetadata(issue.issues[0], path);
    case "Encoding":
      return schemaIssueLeafMetadata(issue.issue, path);
    case "Filter":
      return schemaIssueLeafMetadata(issue.issue, path);
    case "AnyOf":
      return issue.issues[0] === undefined
        ? {
            issuePath: formatIssuePath(path),
            issueMessage: "Nenhum membro da união aceitou o valor.",
            upstreamTag: issue._tag,
          }
        : schemaIssueLeafMetadata(issue.issues[0], path);
    case "InvalidType":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Tipo inválido para o schema.",
        upstreamTag: issue._tag,
      };
    case "InvalidValue":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Valor inválido para o schema.",
        upstreamTag: issue._tag,
      };
    case "MissingKey":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Chave obrigatória ausente no schema.",
        upstreamTag: issue._tag,
      };
    case "UnexpectedKey":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Chave inesperada no schema.",
        upstreamTag: issue._tag,
      };
    case "Forbidden":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Operação proibida durante decode de schema.",
        upstreamTag: issue._tag,
      };
    case "OneOf":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Mais de um membro da união aceitou o valor.",
        upstreamTag: issue._tag,
      };
  }
};

export const schemaErrorMetadata = (error: Schema.SchemaError): SchemaIssueMetadata =>
  schemaIssueLeafMetadata(error.issue);
