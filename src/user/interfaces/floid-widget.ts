import { Document } from 'mongoose';

enum Sender {
    'ABONO DE CREDITO 29600179865' = 'ABONO DE CREDITO 29600179865',
    'ABONO POR TRF DESDE OTRO BANCO EN LINEA' = 'ABONO POR TRF DESDE OTRO BANCO EN LINEA',
    'ABONO TERCEROS 12345678-0 A.PEREZ BAR' = 'ABONO TERCEROS 12345678-0 A.PEREZ BAR',
    'TRANSFER DE FLOW SPA' = 'TRANSFER DE FLOW SPA',
    'TRANSFER DE PEREZ' = 'TRANSFER DE PEREZ',
}

enum Type {
    'extra' = 'extra',
    'main' = 'main',
}

interface Source extends Document {
    sender: Sender;
    amount: number;
    type: Type;
}

interface IncomeByMonth extends Document {
    month: string;
    total: number;
    main: number;
    extra: number;
    date: string;
    sources: Source[];
}

interface IncomeAccount extends Document {
    account_number: number;
    regularity: string;
    totalAverage: number;
    mainAverage: number;
    extraAverage: number;
    mainIncomeDeposit: string;
    incomeByMonth: IncomeByMonth[];
}

interface Products extends Document {
    accounts: ProductsAccount[];
    cards: Card[];
    lines: Line[];
}

interface Transactions extends Document {
    accounts: TransactionsAccount[];
}

interface Income extends Document {
    accounts: IncomeAccount[];
}

interface AccountFloidWidget extends Document {
    consumerId: string;
    caseid: string;
    products: Products;
    transactions: Transactions;
    income: Income;
}

interface ProductsAccount extends Document {
    type: string;
    number: number;
    currency: string;
    balance: number;
}

interface Card extends Document {
    number: string;
    currency: string;
    total: number;
    used: number;
    available: number;
    name: string;
}

interface Line extends Document {
    number: number;
    currency: string;
    total: number;
    used: number;
    available: number;
}

interface TransactionsAccount extends Document {
    account_number: number;
    transactions: Transaction[];
}

interface Transaction extends Document {
    date: string;
    branch: string;
    description: string;
    doc_number: string;
    out: number;
    in: number;
    balance: number;
    id: string;
}

export {
    AccountFloidWidget,
    IncomeAccount,
    IncomeByMonth,
    Products,
    ProductsAccount,
    Card,
    Line,
    Transactions,
    TransactionsAccount,
    Transaction,
    Income
};
