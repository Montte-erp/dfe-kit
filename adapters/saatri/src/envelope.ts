import type { FiscalProviderError, IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { escapeXmlText } from "@dfe-kit/xml";
import { panic, Result } from "better-result";
import dayjs from "dayjs";
import type { SaatriCredentials, SaatriEnvironmentConfig } from "./config";

/**
 * Montagem do envelope SOAP 1.1 do GerarNfse (ABRASF 2.03) para a SAATRI.
 *
 * Fiel aos testes automatizados e ao fixture
 * `GerarNfseRequest.xml` (referencia autoritativa):
 *   - Body = <nfse:GerarNfseRequest> (xmlns:nfse = http://nfse.abrasf.org.br).
 *   - <nfseCabecMsg> e <nfseDadosMsg> sao CADA UM exatamente UM bloco CDATA
 *     embrulhando uma STRING XML crua (nao escapada, nao aninhada).
 *   - cabecalho versao="2.01" + <versaoDados>2.03</versaoDados>.
 *   - Header WS-Security wsse:UsernameToken (Username=CPF, Password #PasswordText
 *     = senha). SEM certificado. SEM wsu:Timestamp (igual ao sample).
 *   - InscricaoMunicipal do prestador e OBRIGATORIA na pratica (a SAATRI retorna
 *     E141 sem ela), apesar do XSD marcar minOccurs=0.
 *
 * Assinatura digital (ICP-Brasil XML-DSig) e OPCIONAL e DESLIGADA por padrao:
 * sem `signer`, o documento sai sem <ds:Signature>. Quando um `signer` e
 * injetado, o GerarNfseEnvio e assinado antes de entrar no CDATA.
 */

export const SOAP_ACTION_GERAR_NFSE = "http://nfse.abrasf.org.br/Infse/GerarNfse";

/** cabecalho fixo (string interna do CDATA de nfseCabecMsg). */
const CABECALHO_INNER =
  '<cabecalho xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.01"><versaoDados>2.03</versaoDados></cabecalho>';

/**
 * Hook de assinatura injetavel. Recebe o XML do GerarNfseEnvio (string crua) e
 * devolve a versao assinada (com <ds:Signature>) ou um erro. OFF por padrao.
 */
export type GerarNfseSigner = (xmlToSign: string) => Promise<Result<string, FiscalProviderError>>;

export interface BuildGerarNfseEnvelopeOptions {
  /** Assinador opcional (XML-DSig). Ausente => documento NAO assinado. */
  readonly signer?: GerarNfseSigner;
}

/** Escapa caracteres reservados de XML em valores de texto. */
/**
 * Normaliza um `issuedAt` ISO para `xsd:date` (YYYY-MM-DD). Os testes automatizados e o fixture
 * de homologacao usam data sem hora; ABRASF aceita date.
 */
const toAbrasfDate = (isoDateTime: string): string => {
  const date = dayjs(isoDateTime);
  if (!date.isValid()) panic("IssueFiscalDocumentInput.issuedAt must be a valid ISO date.");
  return date.format("YYYY-MM-DD");
};

/**
 * Soma a string de valores monetarios dos servicos (ex.: "150.00" + "10.00").
 * Mantem 2 casas decimais. Entradas ja vem validadas pelo schema do core
 * (regex /^\d+(\.\d{2})$/).
 */
const sumMoneyValues = (amounts: readonly string[]): string => {
  const totalCents = amounts.reduce((acc, amount) => {
    const [units = "0", cents = "00"] = amount.split(".");
    return acc + Number.parseInt(units, 10) * 100 + Number.parseInt(cents, 10);
  }, 0);
  const units = Math.trunc(totalCents / 100);
  const cents = (totalCents % 100).toString().padStart(2, "0");
  return `${units}.${cents}`;
};

/**
 * Monta a string XML interna do GerarNfseEnvio (o que vai no CDATA de
 * nfseDadosMsg) — UNSIGNED, conjunto minimo viavel do prestador.
 *
 * Campos fixos do minimo viavel (recon, igual ao cenário mínimo validado nos testes):
 *   IssRetido=2 (nao retido), ExigibilidadeISS=1 (exigivel),
 *   OptanteSimplesNacional=2 (nao optante), IncentivoFiscal=2 (nao), Status=1.
 */
const buildGerarNfseEnvio = (
  input: IssueFiscalDocumentInput,
  credentials: SaatriCredentials,
  config: SaatriEnvironmentConfig,
): string => {
  const issuerCnpj = credentials.issuerCnpj;
  const inscricaoMunicipal = credentials.municipalRegistration;
  const documentNumber = escapeXmlText(input.number);
  const series = escapeXmlText(input.series);
  const issueDate = toAbrasfDate(input.issuedAt);
  const serviceAmount = sumMoneyValues(input.services.map((service) => service.amount));
  // ItemListaServico e Discriminacao vem do primeiro servico (NFS-e da SAATRI
  // emite uma nota por declaracao; agregamos a discriminacao dos itens).
  const firstService = input.services[0];
  const serviceListCode = escapeXmlText(firstService?.serviceListCode ?? "");
  const nbsCode = firstService?.nbsCode;
  const nbsCodeXml =
    nbsCode === undefined ? "" : `\n        <CodigoNbs>${escapeXmlText(nbsCode)}</CodigoNbs>`;
  const description = escapeXmlText(
    input.services.map((service) => service.description).join(" | "),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<GerarNfseEnvio xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Rps>
    <InfDeclaracaoPrestacaoServico Id="Declaracao_${issuerCnpj}">
      <Rps Id="RPS_${documentNumber}">
        <IdentificacaoRps>
          <Numero>${documentNumber}</Numero>
          <Serie>${series}</Serie>
          <Tipo>1</Tipo>
        </IdentificacaoRps>
        <DataEmissao>${issueDate}</DataEmissao>
        <Status>1</Status>
      </Rps>
      <Competencia>${issueDate}</Competencia>
      <Servico>
        <Valores>
          <ValorServicos>${serviceAmount}</ValorServicos>
        </Valores>
        <IssRetido>2</IssRetido>
        <ItemListaServico>${serviceListCode}</ItemListaServico>${nbsCodeXml}
        <Discriminacao>${description}</Discriminacao>
        <CodigoMunicipio>${config.cityCode}</CodigoMunicipio>
        <ExigibilidadeISS>1</ExigibilidadeISS>
      </Servico>
      <Prestador>
        <CpfCnpj>
          <Cnpj>${issuerCnpj}</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>${escapeXmlText(inscricaoMunicipal)}</InscricaoMunicipal>
      </Prestador>
      <OptanteSimplesNacional>2</OptanteSimplesNacional>
      <IncentivoFiscal>2</IncentivoFiscal>
    </InfDeclaracaoPrestacaoServico>
  </Rps>
</GerarNfseEnvio>`;
};

/** Embrulha cabecalho + dados no envelope SOAP 1.1 com WS-Security. */
const wrapEnvelope = (dados: string, credentials: SaatriCredentials): string => {
  const username = escapeXmlText(credentials.username);
  const password = escapeXmlText(credentials.password);
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://nfse.abrasf.org.br">
   <soapenv:Header>
      <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
         <wsse:UsernameToken wsu:Id="UsernameToken-1">
            <wsse:Username>${username}</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <nfse:GerarNfseRequest>
         <nfseCabecMsg><![CDATA[${CABECALHO_INNER}]]></nfseCabecMsg>
         <nfseDadosMsg><![CDATA[${dados}]]></nfseDadosMsg>
      </nfse:GerarNfseRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
};

/**
 * Constroi o envelope SOAP 1.1 completo do GerarNfse.
 *
 * Sem `opts.signer`: o GerarNfseEnvio sai UNSIGNED (sem <ds:Signature>).
 * Com `opts.signer`: o documento e assinado antes de entrar no CDATA. O signer
 * pode falhar (Result.err) — nesse caso o erro tecnico e propagado.
 *
 * Retorna `Result` porque a assinatura e uma operacao que pode falhar; sem
 * signer o resultado e sempre `Result.ok`.
 */
export const buildGerarNfseEnvelope = async (
  input: IssueFiscalDocumentInput,
  credentials: SaatriCredentials,
  config: SaatriEnvironmentConfig,
  opts: BuildGerarNfseEnvelopeOptions = {},
): Promise<Result<string, FiscalProviderError>> => {
  const dadosUnsigned = buildGerarNfseEnvio(input, credentials, config);

  if (opts.signer === undefined) {
    return Result.ok(wrapEnvelope(dadosUnsigned, credentials));
  }

  const signed = await opts.signer(dadosUnsigned);
  return signed.map((dadosSigned) => wrapEnvelope(dadosSigned, credentials));
};
