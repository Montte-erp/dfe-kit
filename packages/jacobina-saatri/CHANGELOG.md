# Changelog

Todas as mudanças publicáveis de `@dfe-kit/jacobina-saatri` são registradas aqui.

## 0.1.1 - 2026-06-12

### Changed

- Migra o provider Jacobina/SAATRI para um fluxo Effect-native completo, com erros técnicos tipados, HTTP via `Context.Service`/`Layer`, retry Effect-native e observabilidade nativa do Effect.
- Expõe subpaths explícitos `@dfe-kit/jacobina-saatri/manifest` e `@dfe-kit/jacobina-saatri/runtime` para separar metadados leves de factories de execução.
- Mantém OpenTelemetry opcional e configurável no runtime da aplicação consumidora, sem dependência obrigatória no pacote publicado.

### Added

- Adiciona validação de endpoint SAATRI e catálogos tipados para spans, métricas, fases, operações e eventos.
- Adiciona guardrails de DTS/static checks para bloquear regressões em geração de declarações e padrões não Effect-native.

### Removed

- Remove dependência interna em `@dfe-kit/utils`; validações CPF/CNPJ agora vivem no core fiscal até haver API estável e múltiplos consumidores reais.
