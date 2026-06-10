# Jacobina/BA — NFS-e SAATRI

Esta pasta concentra os documentos importados do repositório Montte para orientar a primeira implementação do DFeKit.

## Leitura principal

- [`deepresearch-nfse-jacobina-saatri.md`](./deepresearch-nfse-jacobina-saatri.md) — pesquisa técnica focada em Jacobina/BA, SAATRI, ABRASF 2.03, endpoints, autenticação e riscos de homologação.
- [`plano-fiscal-nfe-nfce-nfse-montte.md`](./plano-fiscal-nfe-nfce-nfse-montte.md) — plano fiscal amplo do Montte para NF-e, NFC-e e NFS-e.

## Materiais de referência

- [`reference-materials/prod_wsdl.xml`](./reference-materials/prod_wsdl.xml) — WSDL de produção SAATRI.
- [`reference-materials/homologa_wsdl.xml`](./reference-materials/homologa_wsdl.xml) — WSDL de homologação SAATRI.
- [`reference-materials/manual_webservice.pdf`](./reference-materials/manual_webservice.pdf) — manual oficial do WebService.
- [`reference-materials/webservice.html`](./reference-materials/webservice.html) — página fonte do WebService.
- [`reference-materials/schemas/`](./reference-materials/schemas/) — schemas ABRASF/NFS-e coletados.
- [`reference-materials/exemplos/`](./reference-materials/exemplos/) — envelopes SOAP, payloads XML e respostas de exemplo.

## Decisões já assumidas

- O primeiro alvo é **NFS-e**, não NF-e estadual.
- Jacobina/BA usa provedor **SAATRI**.
- A base dos payloads é **ABRASF 2.03**, apesar de exemplos conterem cabeçalhos `versao="2.01"` com `versaoDados` variando entre `2.01` e `2.03`.
- O transporte observado é SOAP com `nfseCabecMsg` e `nfseDadosMsg` em CDATA.
- Autenticação observada nos exemplos: `wsse:UsernameToken`.
- Assinatura XML com A1 ainda precisa ser comprovada em homologação antes de virar capacidade obrigatória.

## Spike de homologação

Antes de implementar emissão produtiva:

1. Confirmar credenciais válidas no ambiente SAATRI.
2. Confirmar se o contribuinte está habilitado para WebService.
3. Enviar um `GerarNfseRequest` mínimo em homologação.
4. Persistir request XML, response XML, protocolo, status e mensagens de rejeição.
5. Consultar a nota por RPS.
6. Validar se cancelamento e substituição são aceitos no ambiente real.

## Pacote relacionado

O material desta pasta alimenta o pacote:

```text
@dfekit/provider-saatri
```
