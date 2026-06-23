import { describe, expect, it } from "vitest";
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
