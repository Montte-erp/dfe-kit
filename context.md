# Code Context

## Files Retrieved
1. `package.json` (lines 15-28) - scripts de validação; `check:dts-warnings` agora está integrado em `check` e `publish:npm` passa por `check`.
2. `tooling/static-checks/check-declarative-errors.ts` (lines 1-7) - entrypoint fino do checker declarativo.
3. `tooling/static-checks/check-dts-warnings.ts` (lines 1-43) - novo bloqueador de warnings DTS/TS90xx.
4. `tooling/static-checks/src/rules.ts` (lines 1-40, 300-380) - regras estáticas principais; ainda concentradas em um arquivo grande.
5. `adapters/saatri/src/runtime.ts` (lines 1-33) - único `Effect.provide` em código fonte; boundary de convenience explícito.
6. `adapters/saatri/src/http.ts` (lines 1-226) - serviço HTTP Effect-native com `Context.Service`, `Layer`, `Duration`, `Schedule`, `Metric`, `Match` e retry classificado.
7. `adapters/saatri/src/config.ts` (lines 150-230, 300-455) - erro tipado SAATRI, metadados de erro de Schema e credenciais `Redacted`.
8. `adapters/saatri/src/provider.ts` (lines 110-340) - API provider Effect-native, eventos effectful, spans/métricas/logs e rejeição fiscal no canal de sucesso.
9. `adapters/saatri/src/observability.ts` (lines 1-180) - catálogos de spans/attributes/metrics e métricas Effect.
10. `adapters/saatri/src/index.ts` (lines 1-220) - entrypoint público do adapter; sem `export *`, mas ainda amplo e exporta convenience runtime.
11. `core/fiscal/src/index.ts` (lines 1-105) - contratos fiscais derivados de schemas; `FiscalProvider.issue` retorna `Effect.Effect` tipado.
12. `core/fiscal/src/schemas.ts` (lines 1-120) - schemas fiscais com brands para primitivos brasileiros.
13. `packages/jacobina-saatri/src/index.ts` (lines 1-68) - provider package municipal; manifest/config tree-shakeável e factories públicas.
14. `packages/jacobina-saatri/package.json` (lines 1-36) - exports ESM explícitos, `sideEffects: false`, dependência pública só em `effect`.
15. `packages/jacobina-saatri/README.md` (lines 209-248) - decisão documentada: OTel é opcional e configurado pela aplicação consumidora.

## Key Code

### Validação operacional

`package.json` agora integra DTS no `check`:

```json
"check:dts-warnings": "bun tooling/static-checks/check-dts-warnings.ts -- bun nx run-many -t build",
"check": "bun run check:static && nx run-many -t typecheck test build && bun run check:dts-warnings"
```

Resultados locais executados nesta auditoria:

- `bun run check:static`: passou.
- `NX_SKIP_NX_CACHE=true bun run check:dts-warnings`: passou, sem `TS90xx` no output.
- `bun run check`: passou.
- `rg` para `Context.Reference`, `Context.Tag`, `Effect.Tag`, `Effect.Service`, `String(error/reason/cause)`, `throw new Error`, `instanceof Error`, `runSync/runPromise/runFork`, `export *`: sem ocorrência relevante em `core/adapters/packages` fora de README/tooling/test.

### DTS warnings

`tooling/static-checks/check-dts-warnings.ts` procura `TS90xx` no output limpo de ANSI e falha se encontrar:

```ts
const dtsWarningPattern = /\bTS90\d+\b/g;
// ...
if (uniqueCodes.length > 0) {
  console.error(
    `DTS warning check failed. Build gerou warnings de declaração: ${uniqueCodes.join(", ")}.`,
  );
  process.exit(1);
}
```

Evidência: `NX_SKIP_NX_CACHE=true bun run check:dts-warnings` rodou build real dos 4 projetos e passou.

### Effect.provide

Única ocorrência em código fonte principal:

```ts
// adapters/saatri/src/runtime.ts:16-23
export const withSaatriFetchHttpClient = <A, E>(
  effect: Effect.Effect<A, E, RuntimeSaatriHttpClient>,
  options: CreateSaatriHttpOptions = {},
): Effect.Effect<A, E> =>
  effect.pipe(
    // effect-boundary: runtime convenience fecha transporte fetch padrão [allow-provide]
    Effect.provide(createSaatriFetchHttpClientLayer(options)),
  );
```

Isso está aceitável como boundary explícito de convenience, mas deve permanecer restrito a `runtime.ts`.

### HTTP service/layers/retry

`adapters/saatri/src/http.ts` usa:

- `Context.Service` para `SaatriHttpClientRuntimeConfig` e `SaatriHttpClient` (lines 67-79).
- `Layer.succeed`, `Layer.effect`, `Layer.provide` para composição (lines 88-91, 216-226).
- `Duration` para timeout/runtime config (lines 44-48, 81-85).
- retry classificado por erro/status (lines 93-96, 154-170).
- `Metric.update` e `Effect.withSpan` (lines 104, 154-178, 194-202).
- `Match.value(error.reason)` para preservar sem helper ad-hoc de inspeção (lines 112-140).

### Erros estruturados

`adapters/saatri/src/config.ts` define `SaatriProviderError` com `Schema.TaggedErrorClass` e campos estruturados:

```ts
readonly code: SaatriProviderErrorCode;
readonly retryable: boolean;
readonly status?: number;
readonly operation?: string;
readonly phase?: string;
readonly schemaName?: string;
readonly issuePath?: string;
readonly issueMessage?: string;
readonly upstreamTag?: string;
readonly upstreamCode?: string;
```

`schemaErrorMetadata` preserva metadata segura do `SchemaIssue` (lines 300-324). Credenciais usam `Redacted.Redacted<string>` e `Schema.RedactedFromValue` indiretamente via `redactedNonEmptyString` (lines 328-340, 424-440).

### Observability

`adapters/saatri/src/observability.ts` centraliza:

- `SaatriSpanName` e `SaatriSpanNameValue` (lines 5-31).
- `SaatriAttributeName` e `SaatriAttributeNameValue` (lines 33-89).
- `SaatriMetricName` e `SaatriMetricNameValue` (lines 91-123).
- `Metric.counter` para contadores (lines 125-178).
- `Metric.histogram` continua após linha 180 para bytes XML.

`provider.ts` e `http.ts` usam esses catálogos, não strings inline em decision sites críticos.

### OTel

Não há dependência runtime em `@effect/opentelemetry` no código/pacotes. O README documenta decisão explícita:

- pacote principal não depende de OTel nem instancia SDK/exporter no import (README lines 209-218);
- app consumidor configura `@effect/opentelemetry` no boundary (README lines 220-248).

Isso é uma decisão arquitetural válida para tree-shaking, não um gap obrigatório, desde que o claim seja “emite observability nativa Effect e documenta ponte OTel no app”, não “inclui runtime OTel pronto”.

### Static checks

Split atual:

```text
tooling/static-checks/check-declarative-errors.ts
tooling/static-checks/check-dts-warnings.ts
tooling/static-checks/src/config.ts
tooling/static-checks/src/filesystem.ts
tooling/static-checks/src/model.ts
tooling/static-checks/src/normalize.ts
tooling/static-checks/src/observability.ts
tooling/static-checks/src/rules.ts
tooling/static-checks/src/runner.ts
```

`check-declarative-errors.ts` está fino. Porém `src/rules.ts` ainda concentra regras heterogêneas de erro, dependency, observability, Effect boundaries, services, secrets e type-safety. Contagem local: `rules.ts` tem 391 linhas; o total de `src/*.ts` é 614 linhas fora o entrypoint.

## Architecture

O desenho atual está majoritariamente Effect-native:

1. `core/fiscal` define contratos fiscais e schemas. `FiscalProvider.issue` retorna `Effect.Effect<IssueFiscalDocumentResponse, FiscalProviderError>` (`core/fiscal/src/index.ts:100-105`). Rejeição fiscal é status de sucesso (`rejected`) e não falha técnica.
2. `adapters/saatri/src/config.ts` concentra schemas, catálogos e erro tipado SAATRI. Erros são criados nos decision points com `new SaatriProviderError(...)`, carregando `operation`, `phase`, `schemaName`, `issuePath`, `upstreamTag` etc.
3. `adapters/saatri/src/http.ts` modela transporte como serviço `Context.Service` + `Layer`, com Fetch como implementação default. Retry é `Schedule.exponential` e filtrado por erro/status.
4. `adapters/saatri/src/provider.ts` monta fluxo fiscal: valida entrada, constrói envelope, aplica signer opcional, chama HTTP, parseia resposta, emite eventos effectful, spans, logs e métricas.
5. `adapters/saatri/src/runtime.ts` fecha runtime fetch por conveniência. É o único ponto com `Effect.provide` em código principal e tem comentário boundary estreito.
6. `packages/jacobina-saatri` expõe manifest/factories municipais e mantém import principal leve. OTel fica no app consumidor conforme README.
7. `tooling/static-checks` virou guardrail real: checker declarativo + checker DTS. `check` e `publish:npm` passam por esses checks.

## Achados críticos

### Aprovado / melhorou muito

- `bun run check` passou, incluindo `check:dts-warnings`.
- `NX_SKIP_NX_CACHE=true bun run check:dts-warnings` passou sem `TS90xx`, removendo o bloqueio DTS anterior.
- `check:dts-warnings` está integrado em `check` e `publish:npm` via `bun run check`.
- `Effect.provide` foi movido para `adapters/saatri/src/runtime.ts` e protegido com marker local `[allow-provide]`.
- `Context.Service`/`Layer` substituem APIs legadas de serviço no adapter HTTP.
- Secrets SAATRI usam `Redacted` internamente.
- Eventos são Effect-native, não callback unsafe direto.
- Observability nativa Effect existe: spans, logs, counters, histogram e catálogos.
- README documenta estratégia OTel opcional no app consumidor.
- Não há `export *`; entrypoints usam exports nomeados.

### Gaps / riscos restantes

1. **Static split ainda incompleto.** `tooling/static-checks/src/rules.ts` tem 391 linhas e mistura muitas famílias de regra. Não bloqueia Effect-native, mas contraria o objetivo de tooling mais modular/manutenível.
2. **OTel é documentação, não runtime.** Isto é aceitável se for decisão explícita; não é correto dizer que o pacote entrega integração OTel pronta. Claim correto: “emite observability nativa Effect e documenta bridge OTel no boundary da aplicação”.
3. **README usa API OTel potencialmente frágil.** O exemplo importa `@effect/opentelemetry/NodeSdk` mas o pacote não é dependência/devDependency local; o exemplo não é testado por typecheck. Risco de drift com Effect v4 beta.
4. **Entrypoint do adapter ainda é amplo.** `adapters/saatri/src/index.ts` exporta configs, provider, runtime, observability e parser no mesmo entrypoint. Sem `export *`, mas ainda pouco segmentado para tree-shaking/API pública intencional.
5. **Magic strings ainda existem em catálogos e mensagens.** Isso é esperado para catálogos/README/mensagens. O static checker cobre decision sites principais; manter vigilância para não mascarar literals novos com `const` solta fora de Schema/catalog.

## Plano se quiser fechar 100% sem ressalvas

1. **Splitar `tooling/static-checks/src/rules.ts` por família**, mantendo mensagens e comportamento atuais:
   - `src/rules/errors.ts`
   - `src/rules/dependencies.ts`
   - `src/rules/domain-literals.ts`
   - `src/rules/effect-boundaries.ts`
   - `src/rules/effect-services.ts`
   - `src/rules/events.ts`
   - `src/rules/observability.ts`
   - `src/rules/secrets.ts`
   - `src/rules/type-safety.ts`
   - um agregador com lista explícita de regras, se necessário.
2. **Adicionar validação do exemplo OTel**, ou ajustar README para deixar claro que é pseudocódigo dependente da versão de `@effect/opentelemetry`. Melhor: um exemplo em `examples/otel-app-boundary` com `package.json` próprio ou teste docs leve.
3. **Decidir se haverá entrypoint OTel opcional.** Se não houver, registrar em README/AGENTS que OTel é sempre responsabilidade do app consumidor.
4. **Segmentar exports públicos se a API crescer**:
   - manter `.` como provider/manifest principal;
   - considerar subpaths `./runtime`, `./observability`, `./schemas` no adapter, se isso virar API publicada.
5. **Manter checks obrigatórios antes de qualquer claim futuro**:
   - `bun run check:static`
   - `NX_SKIP_NX_CACHE=true bun run check:dts-warnings`
   - `bun run check`
   - scans `rg` para `Effect.provide`, APIs legadas de Context/Effect, `String(error)`, `throw new Error`, `export *`, `@effect/opentelemetry`.

## Start Here

Comece por `tooling/static-checks/src/rules.ts`, porque é o principal gap real restante: o repo já passa checks e DTS, mas o checker ainda concentra regras demais. Depois revise `packages/jacobina-saatri/README.md` lines 209-248 para decidir se o exemplo OTel deve ser testado ou marcado explicitamente como composição de aplicação.

## Veredito

O claim “agora está tudo Effect-native” está **substancialmente correto com ressalvas**. O estado atual passou os bloqueios operacionais que antes invalidavam o claim: `check`, DTS warnings, Effect.provide escondido e OTel não documentado. Eu não chamaria de “perfeito/fechado sem ressalvas” por causa do split incompleto de `rules.ts`, exemplo OTel não typechecked e entrypoint amplo, mas não encontrei bloqueador arquitetural crítico como antes.
