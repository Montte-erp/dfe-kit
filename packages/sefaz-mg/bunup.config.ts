import { defineConfig } from "bunup";
import { dfeKitLibBunup } from "../../tooling/bunup/index";

const base = dfeKitLibBunup([
  "@dfe-kit/fiscal",
  "@dfe-kit/adapter-sefaz",
  "@dfe-kit/adapter-sefaz/catalog",
]);
export default defineConfig({
  ...base,
  entry: ["src/index.ts", "src/manifest.ts"],
  dts: {
    entry: ["src/index.ts", "src/manifest.ts"],
    resolve: ["@dfe-kit/fiscal", "@dfe-kit/adapter-sefaz", "@dfe-kit/adapter-sefaz/catalog"],
    inferTypes: false,
  },
  preferredTsconfig: "./tsconfig.build.json",
});
