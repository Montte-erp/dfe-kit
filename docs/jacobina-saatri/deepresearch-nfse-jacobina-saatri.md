# Deepresearch: implementação de NFS-e para Prefeitura de Jacobina/BA via SAATRI

Data: 2026-06-08  
Escopo: entender como integrar emissão/consulta/cancelamento/substituição de NFS-e para Jacobina/BA no Montte, possivelmente usando certificado digital A1.

## 1. Resumo executivo

Jacobina/BA usa o portal **SAATRI / ADM Sistemas** para NFS-e municipal, não o Emissor Nacional como interface principal de contribuinte. A integração técnica publicada pela própria prefeitura/SAATRI expõe Web Service SOAP no padrão **ABRASF 2.03**, com endpoints separados para homologação e produção.

**Recomendação prática para o Montte:** implementar Jacobina como um adaptador municipal `nfse.saatri.abrasf203`, com fila/job assíncrono, armazenamento de XML/PDF/protocolos e suporte a credenciais por emitente. Começar pela operação `GerarNfse` ou `RecepcionarLoteRpsSincrono`, mas tratar o retorno como assíncrono a partir das adaptações de 2026 descritas no manual SAATRI.

**Ponto crítico sobre certificado A1:** a evidência coletada não prova que Jacobina exija A1 para autenticação do Web Service. O manual SAATRI diz que “todos os serviços deverão ser autenticados por usuário e senha”; os XMLs de exemplo usam `wsse:UsernameToken` com CPF e senha. O WSDL também publica uma porta `/certificate` com token X.509, e o schema ABRASF aceita assinatura XML, então o Montte deve ser desenhado para suportar A1, mas a primeira integração deve validar com SAATRI/Prefeitura se a assinatura/certificado é obrigatório ou apenas opcional/alternativo.

## 2. Fatos verificados

### 2.1 Portal e provedor

- O portal de NFS-e de Jacobina fica em `https://jacobina.saatri.com.br/DocumentoFiscal` e identifica o sistema como **SAATRI Sistema de Auto Atendimento Tributário**.
- A página oficial de manuais da instância Jacobina lista:
  - Manual de Solicitação de Habilitação para Emissão da NFS-e;
  - Manual de Utilização do Web Service da NFS-e;
  - Manual de Substituição Tributária.
- O rodapé do portal informa contato telefônico `74 99966-9939` e a marca ADM Sistemas.

### 2.2 Habilitação e credenciamento

O manual de habilitação da prefeitura/SAATRI diz que a solicitação pode ser feita pela aba **Nota Eletrônica** ou **Econômica**, escolhendo **Solicitar Habilitação Empresas/Autônomos**. O contribuinte preenche CNPJ ou Inscrição Municipal, confere dados cadastrais e preenche os campos obrigatórios de credenciamento.

Para emissão via integração/Web Service, uma fonte operacional de eNotas reporta a rejeição `GW07010` quando a empresa ainda não está liberada para emissão via WebService e orienta solicitar liberação por e-mail/telefone. Como essa fonte não é oficial da prefeitura, trate como evidência secundária, mas útil para playbook de suporte.

### 2.3 Web Service e endpoints

O manual Web Service da instância Jacobina informa:

| Ambiente | Endpoint SOAP | WSDL |
|---|---|---|
| Homologação | `https://homologa-jacobina.saatri.com.br/servicos/nfse.svc` | `https://homologa-jacobina.saatri.com.br/servicos/nfse.svc?wsdl` |
| Produção | `https://jacobina.saatri.com.br/servicos/nfse.svc` | `https://jacobina.saatri.com.br/servicos/nfse.svc?wsdl` |

O WSDL foi baixado com sucesso em 2026-06-08 e lista estas operações:

- `RecepcionarLoteRps`
- `RecepcionarLoteRpsSincrono`
- `GerarNfse`
- `CancelarNfse`
- `ConsultarLoteRps`
- `ConsultarNfsePorRps`
- `ConsultarNfseServicoPrestado`
- `ConsultarNfseServicoTomado`
- `ConsultarNfsePorFaixa`

O manual textual também lista **Substituição de NFS-e**, mas o WSDL baixado não expôs uma operação `SubstituirNfse`; os exemplos SAATRI incluem arquivos `SubstituirNfse*`. Isto deve ser verificado em homologação antes de prometer substituição no produto.

### 2.4 Autenticação

O manual SAATRI afirma: “Todos os serviços deverão ser autenticados por usuário e senha, que serão as mesmas utilizadas no acesso ao portal e serão as mesmas para o ambiente de homologação e produção.”

Os exemplos baixados de `http://www.saatri.com.br/download/exemplos_XML.rar` usam cabeçalho WS-Security `UsernameToken`:

```xml
<wsse:Username>Seu CPF</wsse:Username>
<wsse:Password Type="...#PasswordText">Sua Senha</wsse:Password>
```

O WSDL expõe três portas/bindings:

- `BasicHttpBinding_Infse` em `/Servicos/nfse.svc`, com `UsernameToken` em política WS-Security;
- `WSHttpBindingTransport_Infse` em `/Servicos/nfse.svc/username`;
- `WSHttpBindingTransportCertificate_Infse` em `/Servicos/nfse.svc/certificate`, com `X509Token`.

Inferência: há caminho de autenticação por usuário/senha e há suporte técnico a certificado X.509, mas a documentação municipal de Jacobina prioriza usuário/senha. A1 deve ser tratado como capacidade do vault/adaptador, não como certeza regulatória.

### 2.5 Leiaute, schemas e tamanho

- Modelo: **ABRASF 2.03**.
- Tamanho máximo da mensagem XML: **512 KB**.
- Schemas SAATRI: `http://www.saatri.com.br/download/schema_v2_03.rar`.
- Exemplos XML SAATRI: `http://www.saatri.com.br/download/exemplos_XML.rar`.
- Erros/alertas: `http://www.saatri.com.br/download/Erros_e_Alertas_NFS-e_2.03.xls`.
- A página oficial da ABRASF publica manual, schema e WSDL da versão 2.03.

Adaptação SAATRI 2026/Reforma Tributária informada no manual:

- `ItemListaServico` teve `maxLength` alterado de 5 para 8 para aceitar padrão `xx.xx.xx` ou sem pontos.
- `CodigoNbs` não foi marcado como obrigatório no schema, mas o manual afirma que será obrigatório com base na regra da nota nacional.
- `Consulta de NFS-e por RPS` e `Geração de NFS-e` passam a ter comportamento **assíncrono**, pois a DPS precisa ser compartilhada/validada no ambiente nacional.

### 2.6 Link público da nota

O manual orienta montar link público da NFS-e emitida assim:

```text
https://jacobina.saatri.com.br/Relatorio/VisualizarNotaFiscal?numero=xxxxx&codigoVerificacao=yyyyy
```

onde `numero` é o número da NFS-e sem formatação e `codigoVerificacao` é o código de verificação com traço.

## 3. Implicações para arquitetura Montte

### 3.1 Domínio e fronteira de responsabilidade

Criar ou evoluir um domínio `fiscal` separado de `relationships` e `cashbook`:

- `fiscal_issuer_profiles`: CNPJ, inscrição municipal, regime, município, ambiente, credenciais/refs.
- `fiscal_provider_accounts`: provedor `SAATRI`, município IBGE `2917508`, endpoints, status de credenciamento.
- `fiscal_certificates`: metadados e referência segura ao A1, sem persistir PFX em claro.
- `fiscal_nfse_documents`: rascunho/snapshot fiscal, payload canônico, estado, ambiente.
- `fiscal_nfse_events`: envio, rejeição, autorização, consulta, cancelamento, substituição, erro técnico.
- `fiscal_artifacts`: XML enviado, XML retorno, PDF/DANFSE, protocolos, hash.

Não guardar segredo em tabela comum. Use vault/secret manager/KMS quando disponível; no banco, guardar apenas referência, fingerprint, validade e status.

### 3.2 Máquina de estados mínima

```text
draft
  -> queued
  -> sending
  -> accepted_pending_authorization  # DPS/RPS aceito, aguardando consulta
  -> authorized
  -> rejected
  -> cancellation_queued
  -> cancelled
  -> substitution_queued
  -> substituted
  -> technical_error_retryable
  -> technical_error_terminal
```

Separar erro de negócio fiscal (`rejected`) de erro técnico (`technical_error_retryable`). Isso evita reenvio duplicado de RPS/numeração.

### 3.3 Fluxo de emissão recomendado

1. Usuário configura perfil emissor de Jacobina: CNPJ, Inscrição Municipal, credenciais do portal, ambiente.
2. Sistema valida se há habilitação no portal/prefeitura; se não houver, bloquear emissão real e exibir checklist de credenciamento.
3. Usuário gera rascunho NFS-e com tomador, serviço, valores, `ItemListaServico`, `CodigoNbs`, ISS/retencões e município de incidência.
4. Montte gera XML ABRASF 2.03 adaptado SAATRI e valida contra o schema baixado.
5. Montte envolve XML em SOAP com `nfseCabecMsg` e `nfseDadosMsg` em CDATA e cabeçalho WS-Security.
6. Job envia para homologação/produção.
7. Se retorno for mensagem de DPS/RPS aceita, agendar consulta por RPS/lote após intervalo configurável.
8. Persistir XMLs e eventos em append-only.
9. Ao autorizar, salvar número, código de verificação, link público e PDF/XML.

### 3.4 Operação de cancelamento

Implementar `CancelarNfse` somente após emissão e consulta estarem robustas. Cancelamento deve exigir motivo, chave/número/código de verificação conforme payload ABRASF/SAATRI e gerar evento separado. Não fazer update destrutivo no documento autorizado.

### 3.5 Substituição

Há divergência entre manual textual/exemplos e WSDL baixado. Recomendação: deixar substituição fora do MVP ou atrás de feature flag até teste real em homologação com SAATRI.

## 4. Plano técnico incremental

### Fase 0 — Confirmações obrigatórias com prefeitura/ADM

Perguntas objetivas para enviar antes do desenvolvimento final:

1. A empresa precisa de liberação específica para Web Service além da habilitação de NFS-e no portal?
2. A autenticação oficial para Jacobina é CPF/senha via WS-Security UsernameToken, certificado A1, ou ambos?
3. Assinatura XML com certificado A1 é obrigatória para `GerarNfse`/`RecepcionarLoteRpsSincrono` ou opcional?
4. Qual operação recomendada em 2026: `GerarNfse`, `RecepcionarLoteRpsSincrono` ou lote assíncrono?
5. Qual tempo recomendado de espera para consulta após retorno “DPS gerada/compartilhada”?
6. A substituição está disponível no endpoint de Jacobina? Se sim, qual operação/WSDL?
7. Quais códigos de serviço/tributação municipal devem ser usados para a atividade do cliente?

### Fase 1 — Spike técnico em homologação

- Baixar WSDL e gerar cliente de teste, mas manter opção de chamada SOAP manual por `fetch` para evitar acoplamento excessivo.
- Baixar schema/exemplos SAATRI e criar fixtures versionadas.
- Criar validador XML ABRASF 2.03 + adaptação SAATRI (`ItemListaServico` max 8, `CodigoNbs`).
- Montar chamada `GerarNfse` com UsernameToken.
- Testar uma nota de homologação com valores fictícios.
- Registrar retorno bruto e mapear mensagens SAATRI/ABRASF.

### Fase 2 — MVP Montte

- UI/admin para perfil emissor e ambiente.
- Vault para credenciais e A1 opcional.
- Job de emissão + retry com idempotência por RPS.
- Tabela de eventos/artifacts.
- Consulta por RPS/lote até autorizar/rejeitar.
- Tela de acompanhamento em pt-BR com estados: em fila, enviado, aguardando prefeitura, autorizado, rejeitado, erro técnico.

### Fase 3 — Produção controlada

- Liberar por feature flag para um emitente.
- Exigir emissão de nota teste em homologação antes de produção.
- Bloquear produção se credenciamento WebService não estiver confirmado.
- Alertas para rejeição recorrente, falha de autenticação `GW07010` e certificado vencendo.

## 5. Modelo de dados sugerido, alto nível

```text
fiscal_provider_accounts
  id, team_id, provider='saatri', city_ibge_code='2917508'
  environment, endpoint_url, wsdl_url
  username_secret_ref, password_secret_ref
  certificate_secret_ref nullable
  municipal_registration
  webservice_enabled_status
  created_at, updated_at

fiscal_nfse_documents
  id, team_id, issuer_profile_id, provider_account_id
  environment, status
  rps_number, rps_series, rps_type
  nfse_number nullable, verification_code nullable
  public_url nullable
  service_city_ibge_code, incidence_city_ibge_code
  service_item_code, nbs_code
  gross_amount, iss_amount, aliquot
  payload_snapshot_jsonb
  created_at, updated_at

fiscal_nfse_events
  id, nfse_document_id, type, status
  request_xml_artifact_id nullable
  response_xml_artifact_id nullable
  provider_code nullable
  provider_message nullable
  occurred_at

fiscal_artifacts
  id, team_id, kind
  storage_ref, sha256, content_type
  created_at
```

## 6. Implementação SOAP/XML: detalhes importantes

- Usar namespace SOAP e operação conforme WSDL; exemplos SAATRI alternam SOAP 1.1 e SOAP 1.2 em arquivos diferentes. O binding `BasicHttpBinding_Infse` usa SOAP 1.1; os bindings WSHttp usam SOAP 1.2.
- `nfseCabecMsg` contém XML `cabecalho` com `versaoDados>2.03</versaoDados>`.
- `nfseDadosMsg` contém o XML da operação (`GerarNfseEnvio`, `EnviarLoteRpsEnvio`, etc.) em CDATA.
- UsernameToken deve usar CPF do usuário do portal e senha, conforme exemplos.
- A1: se necessário para assinatura XML, assinar o nó com `Id` relevante (`InfDeclaracaoPrestacaoServico`, `LoteRps`, `Pedido`, etc. conforme operação ABRASF). Se necessário para endpoint `/certificate`, usar WS-Security X.509, não apenas TLS client cert — isso precisa de validação técnica automatizada porque Node/TS pode exigir biblioteca específica.
- Nunca logar XML completo se contiver CPF/CNPJ/tomador/credenciais. Sanitizar logs.

## 7. Riscos e decisões abertas

| Risco | Impacto | Mitigação |
|---|---|---|
| Prefeitura não liberada para WebService | Falha de autenticação/rejeição | Checklist e status de credenciamento antes de emitir |
| A1 obrigatório mas não confirmado | Retrabalho em assinatura/WS-Security | Perguntar à ADM/Prefeitura e implementar vault com A1 desde o desenho |
| Mudanças 2026/Reforma Tributária | Geração síncrona passa a assíncrona | Máquina de estados com polling por RPS/lote |
| Divergência manual vs WSDL para substituição | Feature quebrada | Não incluir substituição no MVP sem homologação |
| Códigos fiscais incorretos (`ItemListaServico`, `CodigoNbs`) | Rejeição fiscal | Cadastro de serviço fiscal por emitente + validação assistida |
| Segredos fiscais/credenciais vazando | Incidente de segurança | Vault, criptografia, mascaramento em logs, RBAC |

## 8. Próximo passo recomendado

Antes de codar no produto, fazer uma **validação automatizada de 1 nota em homologação**:

1. Obter com o cliente: CNPJ, Inscrição Municipal, CPF/senha do portal, confirmação de habilitação e, se houver, certificado A1 de homologação/produção.
2. Pedir liberação de homologação para `suporte.nfse@admsistemas.com.br` com assunto “Homologação NFS-e”, conforme manual SAATRI.
3. Montar fixture `GerarNfseRequest.xml` com dados fictícios e credenciais reais.
4. Enviar para homologação e registrar retorno bruto.
5. Ajustar polling/consulta até obter número/código de verificação ou rejeição fiscal.

Sem essa validação, qualquer implementação de produção fica com incerteza alta em autenticação, assinatura e fluxo assíncrono.

## 9. Fontes

- Prefeitura/SAATRI Jacobina — Sobre NFS-e: https://jacobina.saatri.com.br/DocumentoFiscal
- Prefeitura/SAATRI Jacobina — Manuais: https://jacobina.saatri.com.br/DocumentoFiscal/Manuais
- Prefeitura/SAATRI Jacobina — Manual Web Service PDF: https://jacobina.saatri.com.br/Relatorio/Visualizar?tipoRelatorio=MANUAL_WEB_SERVICE
- Prefeitura/SAATRI Jacobina — Manual Habilitação PDF: https://jacobina.saatri.com.br/Arquivos/Manual%20de%20Solicita%C3%A7%C3%A3o%20de%20Habilita%C3%A7%C3%A3o%20para%20Emiss%C3%A3o%20da%20NFS-e.pdf
- WSDL homologação: https://homologa-jacobina.saatri.com.br/servicos/nfse.svc?wsdl
- WSDL produção: https://jacobina.saatri.com.br/servicos/nfse.svc?wsdl
- Schemas SAATRI: http://www.saatri.com.br/download/schema_v2_03.rar
- Exemplos XML SAATRI: http://www.saatri.com.br/download/exemplos_XML.rar
- Erros/alertas SAATRI/ABRASF: http://www.saatri.com.br/download/Erros_e_Alertas_NFS-e_2.03.xls
- ABRASF — NFS-e versão 2.03: https://abrasf.org.br/biblioteca/arquivos-publicos/nfs-e/versao-2-03
- eNotas — liberação WebService Jacobina/BA, fonte secundária: https://atendimento.enotas.com.br/hc/pt-br/articles/35773579710221-Como-solicitar-libera%C3%A7%C3%A3o-para-emiss%C3%A3o-de-NFS-e-via-integra%C3%A7%C3%A3o-em-Jacobina-BA
- NFE.io — página de prefeitura integrada Jacobina/BA, fonte secundária: https://nfe.io/docs/prefeituras-integradas/bahia/jacobina-ba-2917508/
