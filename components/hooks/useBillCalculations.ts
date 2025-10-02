import { useMemo } from 'react';
import { Bill, Trip, PaymentSummary } from '@/types';

export const useBillCalculations = () => {
    const calculatePaymentSummary = (trip: Trip, bill: Bill): PaymentSummary[] => {
        return useMemo(() => {
            const payer = trip.travelers.find(t => t.id === bill.payerId);
            const payerName = payer?.name || 'Unknown';

            return bill.splits
                .filter(split => split.travelerId !== bill.payerId) // Exclude the payer
                .map(split => {
                    const traveler = trip.travelers.find(t => t.id === split.travelerId);
                    return {
                        travelerId: split.travelerId,
                        travelerName: traveler?.name || 'Unknown',
                        totalOwed: split.amount,
                        totalOwedMYR: split.amountMYR,
                        owesTo: bill.payerId,
                        owesToName: payerName,
                    };
                });
        }, [trip, bill]);
    };

    const calculateTotalExpenses = (trip: Trip): {
        totalInTargetCurrency: number;
        totalInMYR: number;
        billCount: number;
    } => {
        return useMemo(() => {
            const totalInTargetCurrency = trip.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
            const totalInMYR = totalInTargetCurrency / trip.exchangeRate;

            return {
                totalInTargetCurrency,
                totalInMYR,
                billCount: trip.bills.length,
            };
        }, [trip]);
    };

    const calculateIndividualExpenses = (trip: Trip, travelerId: string): {
        totalOwed: number;
        totalOwedMYR: number;
        totalPaid: number;
        totalPaidMYR: number;
        netBalance: number;
        netBalanceMYR: number;
    } => {
        return useMemo(() => {
            let totalOwed = 0;
            let totalPaid = 0;

            trip.bills.forEach(bill => {
                // Calculate what this person owes
                const split = bill.splits.find(s => s.travelerId === travelerId);
                if (split) {
                    totalOwed += split.amount;
                }

                // Calculate what this person paid
                if (bill.payerId === travelerId) {
                    totalPaid += bill.totalAmount;
                }
            });

            const totalOwedMYR = totalOwed / trip.exchangeRate;
            const totalPaidMYR = totalPaid / trip.exchangeRate;
            const netBalance = totalPaid - totalOwed;
            const netBalanceMYR = netBalance / trip.exchangeRate;

            return {
                totalOwed,
                totalOwedMYR,
                totalPaid,
                totalPaidMYR,
                netBalance,
                netBalanceMYR,
            };
        }, [trip, travelerId]);
    };

    const validateBillSplit = (
        totalAmount: number,
        splits: { travelerId: string; amount: number }[]
    ): {
        isValid: boolean;
        difference: number;
        errors: string[];
    } => {
        return useMemo(() => {
            const errors: string[] = [];

            // Check if splits array is not empty
            if (splits.length === 0) {
                errors.push('At least one person must be assigned an amount');
            }

            // Calculate total split amount
            const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
            const difference = Math.abs(totalSplitAmount - totalAmount);

            // Check if amounts match (allow small floating point differences)
            if (difference > 0.01) {
                errors.push(`Split amounts don't match total: difference of ${difference.toFixed(2)}`);
            }

            // Check for negative amounts
            const negativeAmounts = splits.filter(split => split.amount < 0);
            if (negativeAmounts.length > 0) {
                errors.push('Amounts cannot be negative');
            }

            return {
                isValid: errors.length === 0 && difference <= 0.01,
                difference,
                errors,
            };
        }, [totalAmount, splits]);
    };

    return {
        calculatePaymentSummary,
        calculateTotalExpenses,
        calculateIndividualExpenses,
        validateBillSplit,
    };
};