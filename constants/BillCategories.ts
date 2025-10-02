import { BillCategory } from '@/types';

export const BILL_CATEGORIES: BillCategory[] = [
    {
        id: 'food',
        name: 'Food & Dining',
        icon: 'cutlery',
        color: '#FF6B35'
    },
    {
        id: 'transportation',
        name: 'Transportation',
        icon: 'car',
        color: '#4ECDC4'
    },
    {
        id: 'accommodation',
        name: 'Accommodation',
        icon: 'bed',
        color: '#45B7D1'
    },
    {
        id: 'tickets',
        name: 'Tickets & Tours',
        icon: 'ticket',
        color: '#96CEB4'
    },
    {
        id: 'shopping',
        name: 'Shopping & Souvenirs',
        icon: 'shopping-bag',
        color: '#FFEAA7'
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: 'gamepad',
        color: '#DDA0DD'
    },
    {
        id: 'medical',
        name: 'Medical & Health',
        icon: 'plus-square',
        color: '#FF7675'
    },
    {
        id: 'communication',
        name: 'Communication',
        icon: 'phone',
        color: '#74B9FF'
    },
    {
        id: 'miscellaneous',
        name: 'Miscellaneous',
        icon: 'ellipsis-h',
        color: '#A29BFE'
    }
];

export const getDefaultCategory = (): BillCategory => BILL_CATEGORIES[0]; // Food & Dining as default