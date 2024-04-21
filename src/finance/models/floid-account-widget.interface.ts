import { Document } from 'mongoose';

// Transaction Interface
export interface ITransaction extends Document {
    date: Date;
    branch: string;
    description: string;
    doc_number: string;
    out: number;
    in: number;
    balance: number;
    id: string;
    category?: string;  // Optional, categorized in the service layer
}

// Account Interface
export interface IAccount extends Document {
    type: string;
    number: number;
    currency: string;
    balance: number;
    transactions: ITransaction[];
}

// Main FloidAccountWidget Interface
export interface FloidAccountWidgetModel extends Document {
    consumerId: string;
    caseid: string;
    products: {
        accounts: IAccount[];
        cards: any[];  // Could be further defined as needed
        lines: any[];  // Could be further defined as needed
    };
    transactions: {
        accounts: {
            account_number: number;
            transactions: ITransaction[];
        }[];
    };
    income: any[];  // Could be further defined as needed
}
