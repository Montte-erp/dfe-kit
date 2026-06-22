import type { TaxParty } from "@dfe-kit/fiscal";

export const olharyCompany = {
  legalName: "OLHARY LTDA",
  tradeName: "OLHARY",
  cnpj: "60758275000110",
  email: "CONTATO@ESTRATEGIASEMPRESARIAIS.COM",
  phone: "1168148409",
  address: {
    street: "R ILICINIA",
    number: "222",
    district: "HORTO FLORESTAL",
    cityCode: "3550308",
    city: "São Paulo",
    state: "SP",
    postalCode: "02378070",
    countryCode: "1058",
  },
} satisfies TaxParty;
