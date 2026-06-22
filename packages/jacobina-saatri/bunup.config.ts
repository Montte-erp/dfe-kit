import { defineConfig } from "bunup";
import { dfeKitLibBunup } from "../../tooling/bunup/index";

const base = dfeKitLibBunup(["@dfe-kit/fiscal", "@dfe-kit/adapter-saatri"]);
export default defineConfig({
  ...base,
  entry: ["src/index.ts", "src/manifest.ts"],
  dts: {
    entry: ["src/index.ts", "src/manifest.ts"],
    resolve: ["@dfe-kit/fiscal", "@dfe-kit/adapter-saatri"],
    inferTypes: false,
  },
  preferredTsconfig: "./tsconfig.build.json",
});
