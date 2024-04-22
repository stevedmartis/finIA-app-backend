import mongoose, { Schema, Document, model } from 'mongoose';

// Interface for Transaction document
interface ITransaction extends Document {
    date: Date;
    branch: string;
    description: string;
    doc_number: string;
    out: number;
    in: number;
    balance: number;
    category?: string;
}

// Transaction schema
const TransactionSchema = new Schema<ITransaction>({
    date: { type: Date, required: true },
    branch: { type: String, default: "" },
    description: { type: String, required: true },
    doc_number: { type: String, required: true },
    out: { type: Number, required: true },
    in: { type: Number, required: true },
    balance: { type: Number, required: true },
    category: { type: String, default: 'Uncategorized' }
});

// Interface for Account document
interface IAccount extends Document {
    type: string;
    number: number;
    currency: string;
    balance: number;
    transactions: ITransaction[];
}

// Account schema
const AccountSchema = new Schema<IAccount>({
    type: { type: String, required: true },
    number: { type: Number, required: true },
    currency: { type: String, required: true },
    balance: { type: Number, required: true },
    transactions: [TransactionSchema]
});

// Interface for FloidAccountWidget document
interface IFloidAccountWidget extends Document {
    consumerId: string;
    caseid: string;
    userId: mongoose.Types.ObjectId;
    products: any;
    transactions: any;
    income: any[];
}

// FloidAccountWidget schema
const FloidAccountWidgetSchema = new Schema<IFloidAccountWidget>({
    consumerId: { type: String, required: true },
    caseid: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: {
        accounts: [AccountSchema],
        cards: [Schema.Types.Mixed],
        lines: [Schema.Types.Mixed]
    },
    transactions: {
        accounts: [{
            account_number: { type: Number, required: true },
            transactions: [TransactionSchema]
        }]
    },
    income: [Schema.Types.Mixed]
});

// Create models
const FloidAccountWidgetModel = model<IFloidAccountWidget>('FloidAccountWidget', FloidAccountWidgetSchema);
const AccountModel = model<IAccount>('Account', AccountSchema);
const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);

export { FloidAccountWidgetModel, AccountModel, TransactionModel, ITransaction, IAccount, IFloidAccountWidget };
