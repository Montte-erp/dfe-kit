import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { parseGerarNfseResponse } from "../src/parse";

/**
 * SUCCESS fixture, faithful to the GerarNfseResponse.xml docs: SOAP envelope
 * with <GerarNfseResponse><outputXML> wrapping, in CDATA, the
 * <GerarNfseResposta> with ListaNfse/CompNfse/Nfse/InfNfse
 * (Numero + CodigoVerificacao).
 */
const successResponse = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
   <s:Header>
      <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
         <u:Timestamp u:Id="_0">
            <u:Created>2012-06-19T11:50:58.915Z</u:Created>
            <u:Expires>2012-06-19T11:55:58.915Z</u:Expires>
         </u:Timestamp>
      </o:Security>
   </s:Header>
   <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
      <GerarNfseResponse xmlns="http://nfse.abrasf.org.br">
         <outputXML xmlns=""><![CDATA[<GerarNfseResposta xmlns="http://www.abrasf.org.br/nfse.xsd">
  <ListaNfse>
    <CompNfse>
      <Nfse versao="2.01">
        <InfNfse Id="NFSE_Declaracao_000001_AAAFAAAB-CKAAAA">
          <Numero>1</Numero>
          <CodigoVerificacao>AAAFAAAB-CKAAAA</CodigoVerificacao>
          <DataEmissao>2012-06-30T00:00:00</DataEmissao>
        </InfNfse>
      </Nfse>
    </CompNfse>
  </ListaNfse>
</GerarNfseResposta>]]></outputXML>
      </GerarNfseResponse>
   </s:Body>
</s:Envelope>`;

/**
 * Synthetic REJECTION fixture: ListaMensagemRetorno with MensagemRetorno E141
 * (provider municipal registration required), matching what SAATRI returns in
 * practice when the municipal registration is absent.
 */
const rejectionResponse = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
   <s:Body>
      <GerarNfseResponse xmlns="http://nfse.abrasf.org.br">
         <outputXML xmlns=""><![CDATA[<GerarNfseResposta xmlns="http://www.abrasf.org.br/nfse.xsd">
  <ListaMensagemRetorno>
    <MensagemRetorno>
      <Codigo>E141</Codigo>
      <Mensagem>Inscricao Municipal do prestador nao informada.</Mensagem>
      <Correcao>Informe a Inscricao Municipal do prestador.</Correcao>
    </MensagemRetorno>
  </ListaMensagemRetorno>
</GerarNfseResposta>]]></outputXML>
      </GerarNfseResponse>
   </s:Body>
</s:Envelope>`;

const pendingResponse = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
   <s:Body>
      <GerarNfseResponse xmlns="http://nfse.abrasf.org.br">
         <outputXML xmlns=""><![CDATA[<GerarNfseResposta xmlns="http://www.abrasf.org.br/nfse.xsd">
  <ListaMensagemRetorno>
    <MensagemRetorno>
      <Codigo>DPS001</Codigo>
      <Mensagem>DPS gerada e compartilhada com o ambiente nacional. Consulte posteriormente.</Mensagem>
    </MensagemRetorno>
  </ListaMensagemRetorno>
</GerarNfseResposta>]]></outputXML>
      </GerarNfseResponse>
   </s:Body>
</s:Envelope>`;

const requestXml = "<soapenv:Envelope>...request...</soapenv:Envelope>";

describe("parseGerarNfseResponse", () => {
  it.effect("success response -> Effect success with authorized status and artifacts", () =>
    Effect.gen(function* () {
      const response = yield* parseGerarNfseResponse({
        requestXml,
        responseXml: successResponse,
      });
      expect(response.status).toBe("authorized");
      expect(response.providerDocumentId).toBe("1");
      expect(response.protocol).toBe("AAAFAAAB-CKAAAA");
      expect(response.rejections).toHaveLength(0);

      // Raw XML preserved in artifacts.
      const kinds = response.artifacts.map((a) => a.kind);
      expect(kinds).toContain("request_xml");
      expect(kinds).toContain("response_xml");
      expect(kinds).toContain("authorized_xml");
      const responseArtifact = response.artifacts.find((a) => a.kind === "response_xml");
      expect(responseArtifact).toBeDefined();
      expect(new TextDecoder().decode(responseArtifact?.bytes)).toContain("GerarNfseResposta");
      const authorizedArtifact = response.artifacts.find((a) => a.kind === "authorized_xml");
      expect(new TextDecoder().decode(authorizedArtifact?.bytes)).toContain("<ListaNfse>");
    }),
  );

  it.effect("ListaMensagemRetorno -> Effect success with rejected status and rejections[]", () =>
    Effect.gen(function* () {
      const response = yield* parseGerarNfseResponse({
        requestXml,
        responseXml: rejectionResponse,
      });
      // Fiscal rejection is a successful Effect, not a failure.
      expect(response.status).toBe("rejected");
      expect(response.rejections).toHaveLength(1);
      expect(response.rejections[0]?.code).toBe("E141");
      expect(response.rejections[0]?.message).toContain("Inscricao Municipal");
      expect(response.rejections[0]?.correctionHint).toContain("Informe");
      expect(response.providerDocumentId).toBeUndefined();
    }),
  );

  it.effect("mensagem de compartilhamento nacional -> accepted_pending_authorization", () =>
    Effect.gen(function* () {
      const response = yield* parseGerarNfseResponse({ requestXml, responseXml: pendingResponse });
      expect(response.status).toBe("accepted_pending_authorization");
      expect(response.rejections).toHaveLength(0);
      expect(response.artifacts.map((artifact) => artifact.kind)).toContain("response_xml");
    }),
  );

  it.effect("multiple MensagemRetorno entries become multiple rejections", () =>
    Effect.gen(function* () {
      const multi = rejectionResponse.replace(
        "</MensagemRetorno>\n  </ListaMensagemRetorno>",
        "</MensagemRetorno>\n    <MensagemRetorno><Codigo>E160</Codigo><Mensagem>RPS ja informado.</Mensagem></MensagemRetorno>\n  </ListaMensagemRetorno>",
      );
      const response = yield* parseGerarNfseResponse({ requestXml, responseXml: multi });
      expect(response.status).toBe("rejected");
      expect(response.rejections).toHaveLength(2);
      expect(response.rejections.map((r) => r.code)).toEqual(["E141", "E160"]);
    }),
  );

  it.effect("mensagem genérica de processamento continua rejeição fiscal", () =>
    Effect.gen(function* () {
      const genericProcessing = rejectionResponse.replace(
        "Inscricao Municipal do prestador nao informada.",
        "Erro no processamento da declaracao.",
      );
      const response = yield* parseGerarNfseResponse({
        requestXml,
        responseXml: genericProcessing,
      });
      expect(response.status).toBe("rejected");
      expect(response.rejections[0]?.message).toBe("Erro no processamento da declaracao.");
    }),
  );

  it.effect("response without outputXML (for example SOAP Fault) -> technical Effect failure", () =>
    Effect.gen(function* () {
      const fault = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><s:Fault><faultstring>Authentication error</faultstring></s:Fault></s:Body></s:Envelope>`;
      const error = yield* Effect.flip(parseGerarNfseResponse({ requestXml, responseXml: fault }));
      expect(error.code).toBe("saatri.RESPONSE_SHAPE_ERROR");
      expect(error.schemaName).toBe("GenerateNfseSoapDocument");
      expect(error.issuePath).toBe("Envelope.Body.GerarNfseResponse");
      expect(error.issueMessage).toBe("Chave obrigatória ausente no schema.");
      expect(error.upstreamTag).toBe("MissingKey");
    }),
  );

  it.effect("XML de saída fora do schema preserva issue seguro sem serializar input bruto", () =>
    Effect.gen(function* () {
      const invalidOutput = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GerarNfseResponse><outputXML><![CDATA[<GerarNfseResposta><ListaNfse /></GerarNfseResposta>]]></outputXML></GerarNfseResponse></s:Body></s:Envelope>`;
      const error = yield* Effect.flip(
        parseGerarNfseResponse({ requestXml, responseXml: invalidOutput }),
      );
      expect(error.code).toBe("saatri.PARSE_ERROR");
      expect(error.schemaName).toBe("GenerateNfseOutputDocument");
      expect(error.issueMessage).toBeDefined();
      expect(error.issueMessage).not.toContain("GerarNfseResposta");
    }),
  );
});
