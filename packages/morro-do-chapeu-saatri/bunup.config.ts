import { defineConfig } from "bunup";
import { dfeKitLibBunup } from "../../tooling/bunup/index";

const base = dfeKitLibBunup(["@dfe-kit/adapter-saatri", "@dfe-kit/fiscal"]);
export default defineConfig({
  ...base,
  entry: ["src/index.ts", "src/manifest.ts"],
  dts: {
    entry: ["src/index.ts", "src/manifest.ts"],
    resolve: ["@dfe-kit/adapter-saatri", "@dfe-kit/fiscal"],
    inferTypes: false,
  },
  preferredTsconfig: "./tsconfig.build.json",
});
