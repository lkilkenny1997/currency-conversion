import { getCurrencies, getConversion } from '../index';
import { ApiErrorMessages } from '../../constants';

global.fetch = jest.fn();

const mockCurrenciesResponse = {
  USD: {
    id: 1,
    name: 'US Dollar',
    short_code: 'USD',
    symbol: '$',
    precision: 2
  },
  EUR: {
    id: 2,
    name: 'Euro',
    short_code: 'EUR',
    symbol: '€',
    precision: 2
  }
};

const mockConversionResponse = {
  response: {
    value: 85.23,
    rate: 0.8523
  }
};

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrencies', () => {
    it('should fetch and transform currencies successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrenciesResponse)
      });

      const result = await getCurrencies();

      expect(result).toEqual([
        { name: 'US Dollar', code: 'USD', symbol: '$' },
        { name: 'Euro', code: 'EUR', symbol: '€' }
      ]);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/currencies?api_key='));
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(getCurrencies()).rejects.toThrow(ApiErrorMessages.CURRENCIES_FAILED);
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getCurrencies()).rejects.toThrow(ApiErrorMessages.CURRENCIES_FAILED);
    });

    it('should filter out invalid currency entries', async () => {
      const mockResponseWithInvalid = {
        ...mockCurrenciesResponse,
        INVALID: {
          id: 3,
          name: null,
          short_code: null
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseWithInvalid)
      });

      const result = await getCurrencies();

      expect(result).toEqual([
        { name: 'US Dollar', code: 'USD', symbol: '$' },
        { name: 'Euro', code: 'EUR', symbol: '€' }
      ]);
    });
  });

  describe('getConversion', () => {
    const validParams = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: '100'
    };

    it('should convert currency successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversionResponse)
      });

      const result = await getConversion(
        validParams.fromCurrency,
        validParams.toCurrency,
        validParams.amount
      );

      expect(result).toEqual(mockConversionResponse.response);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/convert?api_key=`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`from=${validParams.fromCurrency}`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`to=${validParams.toCurrency}`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`amount=${validParams.amount}`)
      );
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(
        getConversion(validParams.fromCurrency, validParams.toCurrency, validParams.amount)
      ).rejects.toThrow(ApiErrorMessages.CONVERSION_FAILED);
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        getConversion(validParams.fromCurrency, validParams.toCurrency, validParams.amount)
      ).rejects.toThrow(ApiErrorMessages.CONVERSION_FAILED);
    });

    it('should validate required parameters', async () => {
      const invalidRequestResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid parameters' })
      };

      (fetch as jest.Mock).mockResolvedValueOnce(invalidRequestResponse);
      await expect(
        getConversion('', validParams.toCurrency, validParams.amount)
      ).rejects.toThrow(ApiErrorMessages.CONVERSION_FAILED);

      (fetch as jest.Mock).mockResolvedValueOnce(invalidRequestResponse);
      await expect(
        getConversion(validParams.fromCurrency, '', validParams.amount)
      ).rejects.toThrow(ApiErrorMessages.CONVERSION_FAILED);

      (fetch as jest.Mock).mockResolvedValueOnce(invalidRequestResponse);
      await expect(
        getConversion(validParams.fromCurrency, validParams.toCurrency, '')
      ).rejects.toThrow(ApiErrorMessages.CONVERSION_FAILED);
    });
  });
});