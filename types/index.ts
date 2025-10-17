export interface Traveler {
    id: string;
    name: string;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
}

export interface BillCategory {
    id: string;
    name: string;
    icon: string; // FontAwesome icon name
    color: string; // Theme color
}

export interface ReceiptPhoto {
    id: string;
    uri: string; // Local file URI
    name: string; // Original filename
    size: number; // File size in bytes
    type: string; // MIME type
    uploadedAt: Date;
}

export interface Trip {
    id: string;
    name: string;
    travelers: Traveler[];
    baseCurrency: Currency; // Malaysia MYR
    targetCurrency: Currency; // Target country currency
    exchangeRate: number; // Deprecated: kept for backward compatibility
    cardExchangeRate: number; // Current/primary card rate (0 if not used)
    cashExchangeRate: number; // Rate for cash payments (0 if not used)
    createdAt: Date;
    bills: Bill[];
}

export interface MixedRatePayment {
    oldRate: number;
    oldAmount: number; // Amount paid using old rate
    newRate: number;
    newAmount: number; // Amount paid using new rate
}

export interface Bill {
    id: string;
    tripId: string;
    description: string;
    category: BillCategory;
    totalAmount: number; // In target currency
    additionalCharges?: number; // Optional additional charges (tax, service charge, etc.) in target currency
    payerId: string; // Who paid originally
    splits: BillSplit[];
    receiptPhotos?: ReceiptPhoto[]; // Optional receipt attachments
    paymentMethod: 'cash' | 'card'; // Payment method used
    customExchangeRate?: number; // Single exchange rate (if not mixed)
    mixedRates?: MixedRatePayment; // Used when paying with multiple card rates
    createdAt: Date;
}

export interface BillSplit {
    travelerId: string;
    amount: number; // Amount this person owes in target currency
    amountMYR: number; // Amount in MYR for easy reference
}

export interface PaymentSummary {
    travelerId: string;
    travelerName: string;
    totalOwed: number; // In target currency
    totalOwedMYR: number; // In MYR
    owesTo: string; // Payer ID
    owesToName: string; // Payer name
}