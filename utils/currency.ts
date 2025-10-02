/**
 * Utility functions for currency formatting and calculations
 */

import { Currency } from '@/types';

export const formatCurrency = (
    amount: number,
    currency: Currency,
    options: {
        showSymbol?: boolean;
        showCode?: boolean;
        decimals?: number;
    } = {}
): string => {
    const {
        showSymbol = true,
        showCode = false,
        decimals = 2,
    } = options;

    const formattedAmount = amount.toFixed(decimals);

    let result = formattedAmount;

    if (showSymbol) {
        result = `${currency.symbol}${formattedAmount}`;
    }

    if (showCode) {
        result = showSymbol
            ? `${result} ${currency.code}`
            : `${formattedAmount} ${currency.code}`;
    }

    return result;
};

export const convertCurrency = (
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRate: number
): number => {
    // Assuming exchange rate is from base currency (MYR) to target currency
    if (fromCurrency.code === 'MYR' && toCurrency.code !== 'MYR') {
        return amount * exchangeRate;
    }

    if (fromCurrency.code !== 'MYR' && toCurrency.code === 'MYR') {
        return amount / exchangeRate;
    }

    // If both are the same currency
    if (fromCurrency.code === toCurrency.code) {
        return amount;
    }

    // For other currency pairs, convert through MYR
    const amountInMYR = fromCurrency.code === 'MYR' ? amount : amount / exchangeRate;
    return toCurrency.code === 'MYR' ? amountInMYR : amountInMYR * exchangeRate;
};

export const parseAmount = (input: string): number => {
    // Remove any non-digit characters except decimal point
    const cleaned = input.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

export const validateAmount = (amount: string | number): {
    isValid: boolean;
    error?: string;
} => {
    const numAmount = typeof amount === 'string' ? parseAmount(amount) : amount;

    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Please enter a valid number' };
    }

    if (numAmount < 0) {
        return { isValid: false, error: 'Amount cannot be negative' };
    }

    if (numAmount === 0) {
        return { isValid: false, error: 'Amount must be greater than zero' };
    }

    return { isValid: true };
};

export const calculateSplitEqually = (
    totalAmount: number,
    numberOfPeople: number
): number => {
    if (numberOfPeople === 0) return 0;
    return totalAmount / numberOfPeople;
};

export const formatExchangeRate = (
    baseCurrency: Currency,
    targetCurrency: Currency,
    rate: number
): string => {
    return `1 ${baseCurrency.code} = ${rate.toFixed(4)} ${targetCurrency.code}`;
};