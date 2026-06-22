import { describe, expect, it } from "vitest";
import { hasPublishedProviderLayerDependency } from "./dependencies";

describe("hasPublishedProviderLayerDependency", () => {
  it("blocks provider packages depending on another published provider package", () => {
    expect(
      hasPublishedProviderLayerDependency(
        'import { getSaatriProviderByCityCode } from "@dfe-kit/provider-saatri";',
        "packages/jacobina-saatri/src/index.ts",
      ),
    ).toBe(true);

    expect(
      hasPublishedProviderLayerDependency(
        '    "@dfe-kit/provider-saatri": "workspace:*"',
        "packages/jacobina-saatri/package.json",
      ),
    ).toBe(true);
  });

  it("allows provider packages depending on private adapter layers", () => {
    expect(
      hasPublishedProviderLayerDependency(
        'import { getNfseMunicipalPortalByProviderId } from "@dfe-kit/adapter-nfse/municipal-catalog";',
        "packages/juiz-de-fora-nfse/src/index.ts",
      ),
    ).toBe(false);

    expect(
      hasPublishedProviderLayerDependency(
        '  "@dfe-kit/adapter-nfse/municipal-catalog",',
        "packages/juiz-de-fora-nfse/bunup.config.ts",
      ),
    ).toBe(false);
  });

  it("does not treat a package own name as a dependency edge", () => {
    expect(
      hasPublishedProviderLayerDependency(
        '  "name": "@dfe-kit/provider-saatri",',
        "packages/provider-saatri/package.json",
      ),
    ).toBe(false);
  });
});
