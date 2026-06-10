import { defineConfig } from "bunup";
import { dfekitLibBunup } from "../../tooling/bunup/index";

const base = dfekitLibBunup(["@dfekit/fiscal", "@dfekit/xml"]);
export default defineConfig({
  ...base,
  dts: { resolve: ["@dfekit/fiscal", "@dfekit/xml"], inferTypes: false },
  preferredTsconfig: "./tsconfig.build.json",
});
