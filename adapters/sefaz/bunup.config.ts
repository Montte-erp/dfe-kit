import { defineConfig } from "bunup";
import { dfeKitLibBunup } from "../../tooling/bunup/index";

const base = dfeKitLibBunup(["@dfe-kit/fiscal", "@dfe-kit/xml"]);
export default defineConfig({
  ...base,
  entry: ["src/index.ts", "src/catalog.ts", "src/manifest.ts"],
  dts: {
    entry: ["src/index.ts", "src/catalog.ts", "src/manifest.ts"],
    resolve: ["@dfe-kit/fiscal", "@dfe-kit/xml"],
    inferTypes: false,
  },
  preferredTsconfig: "./tsconfig.build.json",
});
