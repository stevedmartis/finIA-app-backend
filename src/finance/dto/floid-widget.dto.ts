export interface FloidAccountWidgetDto {
    consumerId: string;
    caseid: string;
    userId: string;
    products: {
        accounts: IAccountDto[];
        cards: any[];
        lines: any[];
    };
    transactions: {
        accounts: {
            account_number: number;
            transactions: ITransactionDto[];
        }[];
    };
    income: any[];
}

interface ITransactionDto {
    date: Date;
    branch: string;
    description: string;
    doc_number: string;
    out: number;
    in: number;
    balance: number;
    id: string;
    category?: string;  // Optional property for category
}

interface IAccountDto {
    type: string;
    number: number;
    currency: string;
    balance: number;
    transactions: ITransactionDto[];
}
