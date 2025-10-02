export interface Traveler {
    id: string;
    name: string;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
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
    totalAmount: number; // In target currency
    payerId: string; // Who paid originally
    splits: BillSplit[];
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