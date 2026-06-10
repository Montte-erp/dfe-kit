# Licenciamento do DFeKit

DFeKit é **source-available**, não open source.

## Licença escolhida

A licença padrão adotada no repositório é **Business Source License 1.1 (`BUSL-1.1`)**.

Motivo:

- é uma licença source-available conhecida e reconhecida por SPDX/npm;
- permite ler, copiar, modificar, redistribuir e usar em ambiente **não produtivo**;
- bloqueia uso produtivo/comercial sem licença comercial separada;
- permite publicar pacotes no npm com `license: "BUSL-1.1"`;
- preserva para a Montte, como titular/licenciante, o direito de usar, distribuir e licenciar comercialmente o DFeKit por fora da licença pública.

## O que terceiros podem fazer sem licença comercial

Pela licença pública:

- ler o código;
- clonar o repositório;
- rodar testes;
- avaliar segurança;
- modificar localmente;
- usar em desenvolvimento, CI e homologação;
- redistribuir cópias ou forks sob a mesma BUSL.

## O que exige licença comercial da Montte

Exige licença comercial separada:

- uso em produção;
- uso comercial;
- uso em serviço hospedado;
- revenda;
- sublicenciamento comercial;
- uso em produto que ofereça NF-e, NFC-e, NFS-e, DF-e, certificado, automação fiscal ou infraestrutura fiscal similar.

## Direito da Montte

A Montte é a licenciante/titular. A licença pública limita terceiros; ela não remove da Montte o direito de usar, modificar, distribuir, publicar no npm, relicenciar ou vender o DFeKit sob termos comerciais separados.

## Pacotes npm

Todo pacote publicado em `packages/*` deve conter:

```json
{
  "license": "BUSL-1.1"
}
```

E deve incluir uma cópia do arquivo `LICENSE` dentro do pacote publicado. Como npm empacota a partir da pasta do pacote, cada pacote publicado precisa ter seu próprio `LICENSE` ou um processo de build/release que copie o `LICENSE` raiz antes do pack.

## Observação jurídica

Esta é uma escolha técnica de licenciamento baseada em licenças source-available comuns. Antes de vender licenças comerciais em escala, vale revisar o texto final com advogado.
