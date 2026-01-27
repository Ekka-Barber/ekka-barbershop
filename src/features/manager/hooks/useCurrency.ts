import { useMemo, useCallback } from 'react';

type FormatCurrencyOptions = {
  decimalPlaces?: number;
  useGrouping?: boolean;
};

export const useCurrency = () => {
  const formatCurrency = useCallback((
    amount: number,
    options: FormatCurrencyOptions = {}
  ) => {
    const {
      decimalPlaces = 0,
      useGrouping = true
    } = options;

    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping,
    }).format(amount);
  }, []);

  const formatWithSymbol = useCallback((
    amount: number,
    options: FormatCurrencyOptions = {}
  ) => {
    // This returns just the number formatted correctly
    // The actual symbol is rendered separately using the CurrencySymbol component
    return formatCurrency(amount, options);
  }, [formatCurrency]);

  return useMemo(() => ({
    formatCurrency,
    formatWithSymbol,
  }), [formatCurrency, formatWithSymbol]);
};

export default useCurrency; 
