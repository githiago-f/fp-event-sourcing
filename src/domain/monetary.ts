export type Monetary = Readonly<{
  currency: string;
  value: number;
  decimal: number;
}>;

export const monetary = (decimal: number, currency = 'BRL'): Monetary => {
  const value = Number((Number(decimal.toFixed(2)) * 100).toFixed(2));

  return ({
    value,
    decimal,
    currency,
  } as const);
}
