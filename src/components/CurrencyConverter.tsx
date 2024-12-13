import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getConversion, getCurrencies } from '../api';
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

export const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('GBP');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const isMissingConfig =
    !process.env.REACT_APP_CURRENCY_BEACON_API_KEY ||
    !process.env.REACT_APP_CURRENCY_BEACON_API_URL;

 const { data: currencies } = useSuspenseQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies,
  });

  const { data: conversion, isLoading: isConverting } = useQuery({
    queryKey: ['conversion', fromCurrency, toCurrency, amount],
    queryFn: async () => getConversion(fromCurrency, toCurrency, amount),
    enabled: Boolean(amount && fromCurrency && toCurrency) && !isMissingConfig,
  });

  useEffect(() => {
    if (conversion) {
      setConvertedAmount(conversion.value);
    }
  }, [conversion]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

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
          <CardTitle className="flex items-center gap-2">
            Currency Converter
          </CardTitle>
          <CardDescription>
            Select a currency to convert from and to, and enter an amount to see
            real-time conversion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full"
              aria-label="Amount to convert"
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((currency) => (
                  <SelectItem
                    key={`from-${currency.code}`}
                    value={currency.code}
                  >
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={handleSwapCurrencies}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Swap currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((currency) => (
                  <SelectItem key={`to-${currency.code}`} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isConverting ? (
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>Converting...</span>
              </div>
            </div>
          ) : convertedAmount !== null && (
            <div className="p-4 bg-gray-100 rounded-lg transition-opacity">
              <p className="text-lg font-medium text-center">
                {amount} {fromCurrency} = {convertedAmount?.toFixed(2)} {toCurrency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
