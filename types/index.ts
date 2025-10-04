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
    exchangeRate: number; // Rate from base to target
    createdAt: Date;
    bills: Bill[];
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