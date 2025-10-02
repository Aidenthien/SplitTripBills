import { Currency } from '@/types';

export const CURRENCIES: Currency[] = [
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
];

export const DEFAULT_BASE_CURRENCY = CURRENCIES[0]; // MYR