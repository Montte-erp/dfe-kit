import { Schema, type SchemaIssue } from "effect";

export type SafeCauseMetadata = {
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

const firstStringField = (input: unknown, field: string): string | undefined => {
  if (typeof input !== "object" || input === null) {
    return undefined;
  }
  const entry = Object.entries(input).find(([key]) => key === field);
  const value = entry?.[1];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export const safeCauseMetadata = (cause: unknown): SafeCauseMetadata => ({
  upstreamTag: firstStringField(cause, "_tag") ?? firstStringField(cause, "name"),
  upstreamCode: firstStringField(cause, "code"),
});

export type SchemaIssueMetadata = {
  readonly issuePath?: string | undefined;
  readonly issueMessage: string;
  readonly upstreamTag: string;
};

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
