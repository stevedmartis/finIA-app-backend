import { Schema, Document } from 'mongoose';

// Define the schema for a Transaction
const TransactionSchema = new Schema({
    date: { type: Date, required: true },
    branch: { type: String, required: false },
    description: { type: String, required: true },
    doc_number: { type: String, required: true },
    out: { type: Number, required: true },
    in: { type: Number, required: true },
    balance: { type: Number, required: true },
    id: { type: String, required: true },
    category: { type: String, default: 'Uncategorized' } // Optional field with default value
});

// Define the schema for an Account
const AccountSchema = new Schema({
    type: { type: String, required: true },
    number: { type: Number, required: true },
    currency: { type: String, required: true },
    balance: { type: Number, required: true },
    transactions: [TransactionSchema]
});

// Define the main schema for FloidAccountWidget
const FloidAccountWidgetSchema = new Schema({
    consumerId: { type: String, required: true },
    caseid: { type: String, required: true },
    products: {
        accounts: [AccountSchema],
        cards: [{ type: Schema.Types.Mixed }],
        lines: [{ type: Schema.Types.Mixed }]
    },
    transactions: {
        accounts: [{
            account_number: { type: Number, required: true },
            transactions: [TransactionSchema]
        }]
    },
    income: [{ type: Schema.Types.Mixed }]
});

export { FloidAccountWidgetSchema };
