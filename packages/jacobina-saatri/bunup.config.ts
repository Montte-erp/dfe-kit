import { defineConfig } from "bunup";
import { dfekitLibBunup } from "../../tooling/bunup/index";

const base = dfekitLibBunup(["@dfekit/fiscal", "@dfekit/adapter-saatri"]);
export default defineConfig({
  ...base,
  dts: { resolve: ["@dfekit/fiscal", "@dfekit/adapter-saatri"], inferTypes: false },
  preferredTsconfig: "./tsconfig.build.json",
});
