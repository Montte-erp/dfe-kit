import { defineConfig } from "bunup";
import { dfeKitLibBunup } from "../../tooling/bunup/index";

const base = dfeKitLibBunup([
  "@dfe-kit/fiscal",
  "@dfe-kit/adapter-nfse",
  "@dfe-kit/adapter-nfse/municipal-catalog",
]);
export default defineConfig({
  ...base,
  entry: ["src/index.ts"],
  dts: {
    entry: ["src/index.ts"],
    resolve: [
      "@dfe-kit/fiscal",
      "@dfe-kit/adapter-nfse",
      "@dfe-kit/adapter-nfse/municipal-catalog",
    ],
    inferTypes: false,
  },
  preferredTsconfig: "./tsconfig.build.json",
});
