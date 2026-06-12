/**
 * Preset bunup compartilhado do dfe-kit.
 *
 * Lib ESM-only. Pacotes privados @dfe-kit/* (core e engines de provider) NUNCA
 * sao publicados: sao INLINADOS no bundle do package final via `noExternal`, e
 * seus tipos sao inlinados no .d.ts via `dts.resolve`. Assim o package publicado
 * fica self-contained, sem dependencia de runtime em @dfe-kit/*.
 *
 * `dts.inferTypes` fica desligado por padrão: schemas Effect exportados devem ter
 * tipos públicos explícitos antes de habilitar inferência DTS por pacote.
 */
export const dfeKitLibBunup = (noExternal: string[]) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node",
  clean: true,
  dts: { resolve: noExternal, inferTypes: false },
  noExternal,
});
