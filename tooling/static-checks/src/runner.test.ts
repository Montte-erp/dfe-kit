import { describe, expect, it } from "vitest";
import { hasLegacySchemaAnnotation } from "./rules/schema-contracts";
import { isBarrelOnlySource } from "./runner";

describe("isBarrelOnlySource", () => {
  it("blocks direct re-export only files", () => {
    expect(
      isBarrelOnlySource(`
        export { createProvider } from "./provider";
        export type { ProviderConfig } from "./config";
        export * from "./schemas";
      `),
    ).toBe(true);
  });

  it("blocks import plus export-list barrel files", () => {
    expect(
      isBarrelOnlySource(`
        import { createProvider } from "./provider";
        import type { ProviderConfig } from "./config";

        export { createProvider };
        export type { ProviderConfig };
      `),
    ).toBe(true);
  });

  it("allows entrypoints with real declarations", () => {
    expect(
      isBarrelOnlySource(`
        import { createProvider } from "./provider";

        export const createProviderLayer = () => createProvider();
      `),
    ).toBe(false);
  });
});

describe("hasLegacySchemaAnnotation", () => {
  it("blocks removed Effect v4 schema annotation names", () => {
    expect(
      hasLegacySchemaAnnotation("const schema: Schema." + "Decoder<Foo> = Schema.Struct({});"),
    ).toBe(true);
    expect(
      hasLegacySchemaAnnotation("const schema: Schema." + "Schema<Foo> = Schema.Struct({});"),
    ).toBe(true);
  });

  it("allows explicit codec annotations", () => {
    expect(
      hasLegacySchemaAnnotation("const schema: Schema.Codec<Foo, unknown> = Schema.Struct({});"),
    ).toBe(false);
  });
});
