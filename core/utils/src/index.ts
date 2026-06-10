const onlyDigits = (value: string): string => value.replace(/\D/g, "");

const allDigitsEqual = (value: string): boolean => /^(\d)\1+$/.test(value);

export const normalizeDigits = (value: string): string => onlyDigits(value);

export const isValidCpf = (value: string): boolean => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || allDigitsEqual(cpf)) return false;

  const firstDigitSum = cpf
    .slice(0, 9)
    .split("")
    .reduce((sum, digit, index) => sum + Number.parseInt(digit, 10) * (10 - index), 0);
  const firstDigit = (firstDigitSum * 10) % 11;
  const normalizedFirstDigit = firstDigit === 10 ? 0 : firstDigit;

  const secondDigitSum = cpf
    .slice(0, 10)
    .split("")
    .reduce((sum, digit, index) => sum + Number.parseInt(digit, 10) * (11 - index), 0);
  const secondDigit = (secondDigitSum * 10) % 11;
  const normalizedSecondDigit = secondDigit === 10 ? 0 : secondDigit;

  return (
    normalizedFirstDigit === Number.parseInt(cpf[9] ?? "", 10) &&
    normalizedSecondDigit === Number.parseInt(cpf[10] ?? "", 10)
  );
};

export const isValidCnpj = (value: string): boolean => {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || allDigitsEqual(cnpj)) return false;

  const calculateDigit = (base: string, weights: readonly number[]): number => {
    const sum = base
      .split("")
      .reduce(
        (total, digit, index) => total + Number.parseInt(digit, 10) * (weights[index] ?? 0),
        0,
      );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return (
    firstDigit === Number.parseInt(cnpj[12] ?? "", 10) &&
    secondDigit === Number.parseInt(cnpj[13] ?? "", 10)
  );
};

export const isValidBrazilianTaxId = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
};
