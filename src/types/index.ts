export interface CurrencyResponse {
  code: string;
  decimal_mark: string;
  id: number;
  name: string;
  precision: number;
  short_code: string;
  subunit: number;
  symbol: string;
  symbol_first: boolean;
  thousands_separator: string;
}

export interface Currency {
  name: string;
  code: string;
  symbol: string;
}

export interface ConversionResult {
  value: number;
  rate: number;
}