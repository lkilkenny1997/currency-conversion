import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { CurrencyConverter } from '../CurrencyConverter';
import { SkeletonCurrencyConverter } from '../SkeletonCurrencyConverter';
import { getCurrencies, getConversion } from '../../api';

jest.mock('../../api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<SkeletonCurrencyConverter />}>{children}</Suspense>
    </QueryClientProvider>
  );
};

describe('CurrencyConverter', () => {
  const mockCurrencies = [
    { name: 'British Pound', code: 'GBP', symbol: '£' },
    { name: 'Euro', code: 'EUR', symbol: '€' },
    { name: 'US Dollar', code: 'USD', symbol: '$' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrencies as jest.Mock).mockResolvedValue(mockCurrencies);
    (getConversion as jest.Mock).mockResolvedValue({
      value: 85.23,
      rate: 0.8523,
    });

    process.env.REACT_APP_CURRENCY_BEACON_API_KEY = 'test-api-key';
    process.env.REACT_APP_CURRENCY_BEACON_API_URL = 'https://api.test.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial state and loads currencies', async () => {
    await act(async () => {
      render(<CurrencyConverter />, { wrapper: createWrapper() });
    });

    await waitFor(() => {
      const titleElement = screen.getByTestId('currency-converter-title');
      expect(titleElement.textContent).toBe('Currency Converter');
      expect(
        screen.getByTestId('currency-converter-description')
      ).toBeDefined();

      const amountInput = screen.getByTestId(
        'amount-input'
      ) as HTMLInputElement;
      expect(amountInput.value).toBe('1');
    });
  });

  it('handles currency selection by changing props directly', async () => {
    await act(async () => {
      render(<CurrencyConverter />, { wrapper: createWrapper() });
    });

    await waitFor(() => {
      expect(screen.getByTestId('from-currency-trigger')).toBeDefined();
    });

    const fromTrigger = screen.getByTestId('from-currency-trigger');
    expect(fromTrigger.textContent).toContain('British Pound');

    await waitFor(() => {
      expect(getConversion).toHaveBeenCalledWith('GBP', 'EUR', '1');
    });
  });

  it('handles amount input with debouncing', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    await act(async () => {
      render(<CurrencyConverter />, { wrapper: createWrapper() });
    });

    await waitFor(() => {
      expect(screen.getByTestId('amount-input')).toBeDefined();
    });

    const amountInput = screen.getByTestId('amount-input');

    await user.clear(amountInput);
    await user.type(amountInput, '100');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getConversion).toHaveBeenCalledWith('GBP', 'EUR', '100');
    });

    jest.useRealTimers();
  });

  it('handles currency swapping', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<CurrencyConverter />, { wrapper: createWrapper() });
    });

    expect(screen.getByTestId('swap-currencies-button')).toBeDefined();

    await user.click(screen.getByTestId('swap-currencies-button'));

    await waitFor(() => {
      expect(getConversion).toHaveBeenCalledWith('EUR', 'GBP', '1');
    });
  });

  it('displays loading and conversion states', async () => {
    let resolveConversion: (value: any) => void;
    const conversionPromise = new Promise((resolve) => {
      resolveConversion = resolve;
    });

    (getConversion as jest.Mock).mockImplementationOnce(
      () => conversionPromise
    );

    const user = userEvent.setup();

    await act(async () => {
      render(<CurrencyConverter />, { wrapper: createWrapper() });
    });

    await waitFor(() => {
      expect(screen.getByTestId('amount-input')).toBeDefined();
    });

    const amountInput = screen.getByTestId('amount-input');
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    await waitFor(() => {
      expect(screen.getByTestId('converting-indicator')).toBeDefined();
    });

    await act(async () => {
      resolveConversion({ value: 85.23, rate: 0.8523 });
    });

    await waitFor(() => {
      const resultElement = screen.getByTestId('conversion-result');
      expect(resultElement).toBeDefined();
      expect(resultElement.textContent).toContain('85.23');
    });
  });
});
