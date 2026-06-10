import { describe, expect, test } from "bun:test";
import type { IssueFiscalDocumentInput } from "@dfekit/fiscal";
import { Result } from "better-result";
import { buildGerarNfseEnvelope, type GerarNfseSigner } from "../src/envelope";
import type { SaatriCredentials, SaatriEnvironmentConfig } from "../src/config";

const credentials: SaatriCredentials = {
  username: "12345678909",
  password: "secret-password",
  issuerCnpj: "31847389000139",
  municipalRegistration: "111111",
};

const config: SaatriEnvironmentConfig = {
  environment: "homologation",
  endpoint: "https://homologa-jacobina.saatri.com.br/Servicos/nfse.svc",
  cityCode: "2917706",
};

const sampleInput: IssueFiscalDocumentInput = {
  environment: "homologation",
  documentKind: "nfse",
  series: "1",
  number: "1",
  issuedAt: "2026-06-09T00:00:00Z",
  issuer: {
    legalName: "Provider Company LLC",
    cnpj: "31847389000139",
    municipalRegistration: "111111",
    address: {
      street: "Rua Teste",
      number: "100",
      district: "Centro",
      cityCode: "2917706",
      city: "Jacobina",
      state: "BA",
      postalCode: "44700000",
      countryCode: "1058",
    },
  },
  customer: {
    legalName: "Service Customer",
    cpf: "72625701374",
    address: {
      street: "Rua Cliente",
      number: "200",
      district: "Centro",
      cityCode: "2917706",
      city: "Jacobina",
      state: "BA",
      postalCode: "44700000",
      countryCode: "1058",
    },
  },
  services: [
    {
      description: "Homologation test service",
      serviceListCode: "01.05",
      amount: "150.00",
      taxable: true,
    },
  ],
};

describe("buildGerarNfseEnvelope", () => {
  test("builds a SOAP envelope with WS-Security UsernameToken and CDATA, unsigned by default", async () => {
    const result = await buildGerarNfseEnvelope(sampleInput, credentials, config);
    expect(result.isOk()).toBe(true);
    const envelope = result.unwrap();

    // WS-Security UsernameToken (CPF + PasswordText password).
    expect(envelope).toContain("<wsse:Security");
    expect(envelope).toContain("<wsse:UsernameToken");
    expect(envelope).toContain(`<wsse:Username>${credentials.username}</wsse:Username>`);
    expect(envelope).toContain("#PasswordText");
    expect(envelope).toContain(`>${credentials.password}</wsse:Password>`);

    // Correct body element + both CDATA blocks.
    expect(envelope).toContain("<nfse:GerarNfseRequest>");
    expect(envelope).toContain("<nfseCabecMsg><![CDATA[");
    expect(envelope).toContain("<nfseDadosMsg><![CDATA[");

    // Header version 2.01 + data version 2.03.
    expect(envelope).toContain('versao="2.01"');
    expect(envelope).toContain("<versaoDados>2.03</versaoDados>");

    // GerarNfseEnvio with required fields, including InscricaoMunicipal.
    expect(envelope).toContain("<GerarNfseEnvio");
    expect(envelope).toContain("<InfDeclaracaoPrestacaoServico");
    expect(envelope).toContain(`<Cnpj>${credentials.issuerCnpj}</Cnpj>`);
    expect(envelope).toContain(
      `<InscricaoMunicipal>${credentials.municipalRegistration}</InscricaoMunicipal>`,
    );
    expect(envelope).toContain("<ValorServicos>150.00</ValorServicos>");
    expect(envelope).toContain("<ItemListaServico>01.05</ItemListaServico>");
    expect(envelope).toContain(`<CodigoMunicipio>${config.cityCode}</CodigoMunicipio>`);
    expect(envelope).toContain("<Numero>1</Numero>");
    expect(envelope).toContain("<DataEmissao>2026-06-09</DataEmissao>");

    // Not signed by default: no ds:Signature / Signature.
    expect(envelope).not.toContain("ds:Signature");
    expect(envelope).not.toContain("<Signature");
  });

  test("sums multiple service amounts", async () => {
    const multi: IssueFiscalDocumentInput = {
      ...sampleInput,
      services: [
        { description: "A", serviceListCode: "01.05", amount: "150.00", taxable: true },
        { description: "B", serviceListCode: "01.05", amount: "49.90", taxable: true },
      ],
    };
    const envelope = (await buildGerarNfseEnvelope(multi, credentials, config)).unwrap();
    expect(envelope).toContain("<ValorServicos>199.90</ValorServicos>");
    expect(envelope).toContain("<Discriminacao>A | B</Discriminacao>");
  });

  test("signs the document when a signer is injected (ds:Signature present)", async () => {
    const signer: GerarNfseSigner = async (xmlToSign) =>
      Result.ok(
        xmlToSign.replace(
          "</InfDeclaracaoPrestacaoServico>",
          "</InfDeclaracaoPrestacaoServico><ds:Signature>FAKE</ds:Signature>",
        ),
      );
    const envelope = (
      await buildGerarNfseEnvelope(sampleInput, credentials, config, { signer })
    ).unwrap();
    expect(envelope).toContain("<ds:Signature>FAKE</ds:Signature>");
  });

  test("propagates signer failure as Result.err", async () => {
    const signer: GerarNfseSigner = async () =>
      Result.err({
        code: "SIGN_ERROR",
        message: "Invalid certificate.",
        retryable: false,
      });
    const result = await buildGerarNfseEnvelope(sampleInput, credentials, config, {
      signer,
    });
    expect(result.isErr()).toBe(true);
  });
});
