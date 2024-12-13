import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRightLeft } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { getConversion, getCurrencies } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ApiErrorMessages } from '../constants';

export const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('GBP');
  const [toCurrency, setToCurrency] = useState<string>('EUR');

  const isMissingConfig =
    !process.env.REACT_APP_CURRENCY_BEACON_API_KEY ||
    !process.env.REACT_APP_CURRENCY_BEACON_API_URL;

  const { data: currencies, error: currenciesError } = useSuspenseQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies,
    staleTime: 24 * 60 * 60 * 1000, // We can cache this for 24 hours because it's unlikely to change
  });

  const {
    data: conversion,
    isLoading: isConverting,
    error: conversionError,
  } = useQuery({
    queryKey: ['conversion', fromCurrency, toCurrency, amount],
    queryFn: async () => getConversion(fromCurrency, toCurrency, amount),
    enabled: Boolean(amount && fromCurrency && toCurrency) && !isMissingConfig,
    retry: false,
  });

  const debouncedSetAmount = useDebounce((value: string) => {
    setAmount(value);
  }, 500);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        debouncedSetAmount(value);
      }
    },
    [debouncedSetAmount]
  );

  const handleSwapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  if (isMissingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing required environment variables</AlertTitle>
          <AlertDescription className="mt-2">
            Please check your .env file and ensure both{' '}
            <strong>REACT_APP_CURRENCY_BEACON_API_KEY</strong> and{' '}
            <strong>REACT_APP_CURRENCY_BEACON_API_URL</strong> are set.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            data-testid="currency-converter-title"
          >
            Currency Converter
          </CardTitle>
          <CardDescription data-testid="currency-converter-description">
            Select a currency to convert from and to, and enter an amount to see
            real-time conversion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currenciesError && (
            <Alert variant="destructive" data-testid="currencies-error">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error fetching currencies</AlertTitle>
              <AlertDescription>
                {currenciesError instanceof Error
                  ? currenciesError.message
                  : ApiErrorMessages.CURRENCIES_FAILED}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              defaultValue={amount}
              onChange={handleAmountChange}
              className="w-full"
              aria-label="Amount to convert"
              data-testid="amount-input"
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <Select
              value={fromCurrency}
              onValueChange={setFromCurrency}
              data-testid="from-currency-select"
            >
              <SelectTrigger data-testid="from-currency-trigger">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map((currency) => (
                    <SelectItem
                      key={`from-${currency.code}`}
                      value={currency.code}
                      data-testid={`currency-option-${currency.code}`}
                    >
                      {currency.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <button
              onClick={handleSwapCurrencies}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Swap currencies"
              data-testid="swap-currencies-button"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <Select
              value={toCurrency}
              onValueChange={setToCurrency}
              data-testid="to-currency-select"
            >
              <SelectTrigger data-testid="to-currency-trigger">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map((currency) => (
                    <SelectItem
                      key={`to-${currency.code}`}
                      value={currency.code}
                      data-testid={`currency-option-${currency.code}`}
                    >
                      {currency.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {conversionError && (
            <Alert variant="destructive" data-testid="conversion-error">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error converting currency</AlertTitle>
              <AlertDescription>
                {conversionError instanceof Error
                  ? conversionError.message
                  : ApiErrorMessages.CONVERSION_FAILED}
              </AlertDescription>
            </Alert>
          )}

          {isConverting ? (
            <div
              className="p-4 bg-gray-100 rounded-lg"
              data-testid="converting-indicator"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>Converting...</span>
              </div>
            </div>
          ) : (
            !conversionError &&
            conversion?.value !== undefined && (
              <div
                className="p-4 bg-gray-100 rounded-lg transition-opacity"
                data-testid="conversion-result"
              >
                <p className="text-lg font-medium text-center">
                  {amount} {fromCurrency} = {conversion.value.toFixed(2)}{' '}
                  {toCurrency}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;
