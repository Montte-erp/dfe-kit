export const XML_MEDIA_TYPE = "application/xml";

const textEncoder = new TextEncoder();

export const escapeXmlText = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const encodeUtf8 = (value: string): Uint8Array => textEncoder.encode(value);

export const getUtf8ByteLength = (value: string): number => encodeUtf8(value).byteLength;
