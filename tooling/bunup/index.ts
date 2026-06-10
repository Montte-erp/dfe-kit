/**
 * Preset bunup compartilhado do dfekit.
 *
 * Lib ESM-only. Pacotes privados @dfekit/* (core e engines de provider) NUNCA
 * sao publicados: sao INLINADOS no bundle do package final via `noExternal`, e
 * seus tipos sao inlinados no .d.ts via `dts.resolve`. Assim o package publicado
 * fica self-contained, sem dependencia de runtime em @dfekit/*.
 *
 * `dts.inferTypes` usa o tsc para gerar os .d.ts (lida com os tipos inferidos do
 * zod sem exigir anotacoes explicitas / isolatedDeclarations).
 */
export const dfekitLibBunup = (noExternal: string[]) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node",
  clean: true,
  dts: { resolve: noExternal, inferTypes: true },
  noExternal,
});
