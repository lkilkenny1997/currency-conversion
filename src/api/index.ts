import { ApiErrorMessages } from "../constants";
import type { CurrencyResponse } from "@/types";

const API_KEY = process.env.REACT_APP_CURRENCY_BEACON_API_KEY;
const BASE_URL = process.env.REACT_APP_CURRENCY_BEACON_API_URL;

export const getCurrencies = async () => {
   try {
    const response = await fetch(`${BASE_URL}/currencies?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(ApiErrorMessages.CURRENCIES_FAILED);
    }
    const data: Record<string, CurrencyResponse> = await response.json();

    return Object.values(data)
      .filter((currency) => currency && currency.short_code && currency.name)
      .map((currency) => ({
        name: currency.name,
        code: currency.short_code,
        symbol: currency.symbol || currency.short_code,
      }));
   } catch {
    throw new Error(ApiErrorMessages.CURRENCIES_FAILED);
  }
};

export const getConversion = async (fromCurrency: string, toCurrency: string, amount: string) => {
  try {
    if (!fromCurrency || !toCurrency || !amount) {
      throw new Error(ApiErrorMessages.INVALID_PARAMETERS);
    }
    
    const response = await fetch(
      `${BASE_URL}/convert?api_key=${API_KEY}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
    );
    
    if (!response.ok) {
      throw new Error(ApiErrorMessages.CONVERSION_FAILED);
    }
    
    const data = await response.json();
    
    return data.response;
  } catch (error) {
       throw new Error(ApiErrorMessages.CONVERSION_FAILED);
  }
};