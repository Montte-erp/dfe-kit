import type { IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { Redacted } from "effect";
import type { SaatriCredentials, SaatriMunicipalityDescriptor } from "../src/index";

export const integrationCredentials: SaatriCredentials = {
  username: "12345678909",
  password: Redacted.make("secret-password"),
  issuerCnpj: "31847389000139",
  municipalRegistration: "111111",
};

export const createMunicipalNfseInput = (
  municipality: SaatriMunicipalityDescriptor,
): IssueFiscalDocumentInput => ({
  environment: "homologation",
  documentKind: "nfse",
  series: "INT",
  number: municipality.config.cityCode,
  issuedAt: "2026-06-21T00:00:00Z",
  issuer: {
    legalName: `Prestador ${municipality.cityName} LTDA`,
    cnpj: integrationCredentials.issuerCnpj,
    municipalRegistration: integrationCredentials.municipalRegistration,
    address: {
      street: "Rua Fiscal",
      number: "100",
      district: "Centro",
      cityCode: municipality.config.cityCode,
      city: municipality.cityName,
      state: municipality.state,
      postalCode: "44700000",
      countryCode: "1058",
    },
  },
  customer: {
    legalName: "Cliente Tomador",
    cpf: "72625701374",
    address: {
      street: "Rua Cliente",
      number: "200",
      district: "Centro",
      cityCode: municipality.config.cityCode,
      city: municipality.cityName,
      state: municipality.state,
      postalCode: "44700000",
      countryCode: "1058",
    },
  },
  services: [
    {
      description: `Serviço municipal ${municipality.cityName}`,
      serviceListCode: "010101",
      nbsCode: "123456789",
      amount: "150.00",
      taxRate: "2.00",
      taxable: true,
    },
  ],
});

export const createSaatriAuthorizedResponse = (
  invoiceNumber: string,
  verificationCode: string,
): string => `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <GerarNfseResponse xmlns="http://nfse.abrasf.org.br">
      <outputXML xmlns=""><![CDATA[<GerarNfseResposta xmlns="http://www.abrasf.org.br/nfse.xsd">
  <ListaNfse>
    <CompNfse>
      <Nfse versao="2.03">
        <InfNfse Id="NFSE_${invoiceNumber}">
          <Numero>${invoiceNumber}</Numero>
          <CodigoVerificacao>${verificationCode}</CodigoVerificacao>
          <DataEmissao>2026-06-21T00:00:00</DataEmissao>
        </InfNfse>
      </Nfse>
    </CompNfse>
  </ListaNfse>
</GerarNfseResposta>]]></outputXML>
    </GerarNfseResponse>
  </s:Body>
</s:Envelope>`;
