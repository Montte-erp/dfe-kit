# Revisão crítica — migração Effect-native DFeKit

Data: 2026-06-12  
Branch observada: `migrate-effect-v4`  
Modo: auditoria adversarial de falsos positivos, sem edição de código-fonte.

## Summary

A migração avançou bastante desde a auditoria anterior: `bun run check` agora inclui `check:dts-warnings`, o build sem cache não emitiu `TS90xx`, `check-declarative-errors.ts` virou entrypoint fino, `Effect.provide` foi movido para `adapters/saatri/src/runtime.ts`, e os fluxos principais do SAATRI usam `Effect.withSpan`, `Metric` e erros tipados.

Ainda assim, eu **não trataria “tudo Effect-native” como totalmente comprovado**. O estado atual parece operacionalmente verde, mas há falsos positivos possíveis: o verificador DTS só detecta códigos `TS90xx`, o comando padrão ainda permite cache Nx, o exemplo OTel do README não é validado em CI/docs tests, `rules.ts` continua grande e regex-based, e a API pública do pacote municipal continua um bundle self-contained amplo que dificulta provar tree-shaking real.

## Strengths

- [S1] `bun run check` agora chama `bun run check:dts-warnings`, então warnings DTS deixaram de ser completamente fora do pipeline principal.
- [S2] `NX_SKIP_NX_CACHE=true bun run check:dts-warnings` passou na auditoria atual; não vi `TS90xx` no build fresco capturado em `/tmp/dfekit-dts-warnings-review-nocache.log`.
- [S3] O único `Effect.provide` em código de produção apareceu em `adapters/saatri/src/runtime.ts`, com comentário boundary e allowlist específica em `tooling/static-checks/src/config.ts`.
- [S4] O README documenta uma decisão arquitetural aceitável para OTel: DFeKit emite spans/métricas/logs nativos do Effect, e a aplicação consumidora configura `@effect/opentelemetry`.

## Weaknesses

- [W1] **MAJOR:** `check:dts-warnings` ainda tem falso negativo para warnings genéricos. O script só busca `TS90\d+`; um comando que imprime `WARN synthetic dts warning` saiu com exit code 0. Se bunup/unplugin-dts emitir warning sem código TS90xx, o pipeline passa.
- [W2] **MAJOR:** o script padrão de DTS não força `--skip-nx-cache` / `NX_SKIP_NX_CACHE=true`. O build fresco passou nesta auditoria, mas a garantia automatizada ainda depende do comportamento do cache Nx e do conteúdo replayado pelo cache.
- [W3] **MAJOR:** o exemplo OTel do README é plausível e alinhado com exemplo upstream, mas não é compilado/testado localmente. Como `@effect/opentelemetry` e peers não estão no workspace, não há garantia automatizada de que o snippet seguirá compilando com Effect v4 beta.
- [W4] **MAJOR:** a API convenience ainda fecha dependência com `Effect.provide`. Está melhor isolada em `runtime.ts`, mas ainda é uma API pública que esconde requirements. Isso é aceitável como boundary explícito, mas não deve ser vendido como “layer-first puro”.
- [W5] **MAJOR:** `tooling/static-checks/src/rules.ts` continua concentrando 391 linhas e várias regras regex-based. Isso aumenta risco de falso positivo/falso negativo e dificulta fixtures negativas por família.
- [W6] **MAJOR:** os static checks são guardrails, não prova semântica. Há regras line/window-based que podem ser burladas por alias, quebras de linha incomuns, composição fora do padrão, comentários ou APIs equivalentes.
- [W7] **MAJOR:** tree-shaking/public API ainda não está demonstrado. O package municipal é self-contained via `noExternal`/`dts.resolve`, e o bundle `packages/jacobina-saatri/dist/index.js` contém `fast-xml-parser`, HTTP client Effect e adapter inteiro. Isso pode ser intencional para publicação standalone, mas conflita com uma afirmação forte de import principal mínimo/tree-shakable.
- [W8] **MINOR:** a documentação diz que o import principal não instancia SDK/exporter/cliente HTTP/provider OTel, o que é específico a OTel; porém o bundle principal avalia bastante código de adapter. Seria bom separar “sem side effect OTel” de “bundle mínimo/tree-shaking”.

## Questions for Authors

- [Q1] O `check:dts-warnings` deve falhar para qualquer linha contendo `WARN`, `warning`, `DTS`, `declaration`, ou apenas para `TS90xx`? Hoje a regra é estreita demais para a política declarada.
- [Q2] O CI deve rodar `check:dts-warnings` com `NX_SKIP_NX_CACHE=true` ou usar `nx run-many -t build --skip-nx-cache` para publicação?
- [Q3] O snippet OTel do README será validado por doctest/tsconfig de exemplos com deps opcionais instaladas?
- [Q4] A API pública desejada é “pacote municipal self-contained” ou “entrypoints pequenos e tree-shakable”? As duas metas podem tensionar uma à outra.
- [Q5] O runtime convenience deve permanecer no entrypoint principal ou virar subpath `./runtime` para deixar o import principal layer/schema/manifest-first?

## Verdict

**Veredito:** parcialmente aprovado, mas eu não aceitaria a frase “tudo Effect-native terminado” sem qualificadores.

- Operacionalmente: **verde no que rodei** (`check`, DTS sem cache, static checks).
- Arquiteturalmente: **bom progresso**, mas ainda com pontos frágeis de auditoria e empacotamento.
- Confiança: **0,72**.

Eu aprovaria uma comunicação como: “migração Effect-native principal concluída, com guardrails e DTS limpo; restam hardening de checks, doctest OTel e avaliação de tree-shaking”. Não aprovaria: “tudo terminado e comprovado”.

## Revision Plan

1. **Endurecer `check:dts-warnings`:** detectar `TS90xx` e também warnings genéricos de DTS/bunup/unplugin-dts; adicionar teste sintético que prova falha para `WARN synthetic`.
2. **Forçar build fresco no check de publicação:** mudar script para `NX_SKIP_NX_CACHE=true` ou `nx run-many -t build --skip-nx-cache`; se quiser cache no dev, criar `check:dts-warnings:fresh` para CI/publish.
3. **Validar README OTel:** criar exemplo compilável em `examples/otel` ou teste de docs com deps opcionais; no mínimo manter snippet sincronizado com exemplo upstream de `@effect/opentelemetry`.
4. **Isolar runtime convenience:** considerar subpath `@dfe-kit/adapter-saatri/runtime` e/ou `@dfe-kit/jacobina-saatri/runtime`, mantendo entrypoint principal sem `Effect.provide`.
5. **Split real de rules:** quebrar `rules.ts` em `rules/errors.ts`, `rules/effect-boundaries.ts`, `rules/observability.ts`, `rules/domain-literals.ts`, `rules/secrets.ts`, `rules/dependencies.ts`, `rules/contracts.ts`, cada uma com fixtures negativas.
6. **Reduzir fragilidade regex:** quando possível, migrar regras críticas para parser AST leve ou fixtures de snapshot; pelo menos testar bypasses com quebras de linha, aliases e comentários.
7. **Provar tree-shaking:** adicionar análise de bundle/side-effects para `import { jacobinaSaatriManifest } ...`; se o objetivo for self-contained, documentar que o pacote municipal bundleia adapter inteiro por design.

## Inline Annotations

> `const dtsWarningPattern = /\bTS90\d+\b/g;`

**[W1] MAJOR:** esta é a única regra de detecção de warnings DTS. Evidência: `bun tooling/static-checks/check-dts-warnings.ts -- bash -lc 'echo "WARN synthetic dts warning"'` retornou exit 0. O script só falha para `TS90xx`.

> `"check:dts-warnings": "bun tooling/static-checks/check-dts-warnings.ts -- bun nx run-many -t build"`

**[W2] MAJOR:** o comando não força build fresco. Nesta auditoria, `NX_SKIP_NX_CACHE=true bun run check:dts-warnings` passou, então não há dívida DTS visível agora; mesmo assim, o script padrão ainda pode replayar cache Nx.

> `"check": "bun run check:static && nx run-many -t typecheck test build && bun run check:dts-warnings"`

**[S1]:** melhoria real: o check DTS agora está integrado ao `bun run check`. Isso corrige um bloqueio anterior.

> `import * as NodeSdk from "@effect/opentelemetry/NodeSdk";`

**[W3] MAJOR:** o exemplo README depende de pacotes opcionais não instalados no workspace. O snippet parece compatível com exemplo upstream de `@effect/opentelemetry`, mas não há validação automatizada local.

> `const result = await Effect.runPromise(provider.issue(input).pipe(Effect.provide(OtelLive)));`

**[W3] MAJOR:** exemplo de aplicação é boundary válido, mas precisa de doctest/compilação. Como README é ignorado pelos static checks (`skippedSuffixes` inclui `README.md`), regressões nesse snippet não seriam capturadas.

> `// effect-boundary: runtime convenience fecha transporte fetch padrão [allow-provide]`
> `Effect.provide(createSaatriFetchHttpClientLayer(options)),`

**[W4] MAJOR:** o boundary está explícito e localizado, o que é bom. Ainda assim, esta função pública esconde requirements e deve ser descrita como convenience runtime, não como API principal layer-first.

> `export const allowedEffectProvideSites = new Map<string, readonly string[]>([["adapters/saatri/src/runtime.ts", ["createSaatriFetchHttpClientLayer(options)"]]]);`

**[S3]/[W6]:** allowlist ficou bem mais estreita do que antes. Porém a validação ainda é string/window-based; alterações equivalentes podem escapar ou gerar falso positivo.

> `const hasEffectProvideCall = (context: CheckContext): boolean => /\bprovide(?:Service|Layer)?\b/.test(context.line) && /\bEffect\s*\.\s*provide(?:Service|Layer)?\s*\(/.test(context.window);`

**[W6] MAJOR:** regra frágil por regex. Ela pressupõe `Effect.provide...` dentro da janela normalizada; aliases, composição diferente ou novas APIs podem escapar.

> `export const checks: readonly Check[] = [`

**[W5] MAJOR:** `rules.ts` ainda tem 391 linhas e concentra famílias heterogêneas de regras. O entrypoint fino foi resolvido, mas o módulo de regras ainda precisa split e fixtures.

> `export const dfeKitLibBunup = (noExternal: string[]) => ({ ... noExternal, dts: { resolve: noExternal, inferTypes: false } })`

**[W7] MAJOR:** isso documenta uma escolha de pacote self-contained. É válido para publicação, mas precisa ser reconciliado com qualquer claim de tree-shaking/import mínimo.

> `// ../../node_modules/.bun/fast-xml-parser@4.5.6/...`

**[W7] MAJOR:** evidência no bundle `packages/jacobina-saatri/dist/index.js`: o pacote municipal inclui `fast-xml-parser` e o adapter inteiro. Se isso é intencional, documentar; se não, criar subpaths/externals.

## Evidência executada

- `bun run check:static` — passou.
- `bun run check` — passou.
- `NX_SKIP_NX_CACHE=true bun run check:dts-warnings` — passou, sem `TS90xx` no log capturado.
- Teste sintético: `WARN synthetic dts warning` passou indevidamente no `check-dts-warnings`.
- Teste sintético: `TS9010 synthetic` falhou corretamente.
- `wc -l tooling/static-checks/src/rules.ts` — 391 linhas.
- `rg @effect/opentelemetry package.json bun.lock adapters packages core` — só README; sem deps locais.
- `rg fast-xml-parser packages/jacobina-saatri/dist/index.js` — bundle municipal contém parser/adaptação.

## Sources

- Exemplo upstream de OTel consultado: https://github.com/Effect-TS/effect/blob/main/packages/opentelemetry/examples/otlp-exporter.ts
