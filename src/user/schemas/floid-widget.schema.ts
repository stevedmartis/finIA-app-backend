const mongoose = require('mongoose');

// Definir el esquema de Mongoose para Source
export const SourceSchema = new mongoose.Schema({
    sender: { type: String, enum: ['ABONO DE CREDITO 29600179865', 'ABONO POR TRF DESDE OTRO BANCO EN LINEA', 'ABONO TERCEROS 12345678-0 A.PEREZ BAR', 'TRANSFER DE FLOW SPA', 'TRANSFER DE PEREZ'] },
    amount: { type: Number },
    type: { type: String, enum: ['extra', 'main'] }
});

// Definir el esquema de Mongoose para IncomeByMonth
export const IncomeByMonthSchema = new mongoose.Schema({
    month: { type: String },
    total: { type: Number },
    main: { type: Number },
    extra: { type: Number },
    date: { type: Date },
    sources: [SourceSchema] // Usar el esquema de Source como un subdocumento
});

// Definir el esquema de Mongoose para IncomeAccount
export const IncomeAccountSchema = new mongoose.Schema({
    account_number: { type: Number },
    regularity: { type: String },
    totalAverage: { type: Number },
    mainAverage: { type: Number },
    extraAverage: { type: Number },
    mainIncomeDeposit: { type: String },
    incomeByMonth: [IncomeByMonthSchema] // Usar el esquema de IncomeByMonth como un subdocumento
});

// Definir el esquema de Mongoose para FloidWidgetResponse
export const FloidAccountWidgetSchema = new mongoose.Schema({
    consumerId: { type: String },
    caseid: { type: String },
    products: {
        accounts: [{
            type: { type: String },
            number: { type: Number },
            currency: { type: String },
            balance: { type: Number }
        }],
        cards: [{
            number: { type: String },
            currency: { type: String },
            total: { type: Number },
            used: { type: Number },
            available: { type: Number },
            name: { type: String }
        }],
        lines: [{
            number: { type: Number },
            currency: { type: String },
            total: { type: Number },
            used: { type: Number },
            available: { type: Number }
        }]
    },
    transactions: {
        accounts: [{
            account_number: { type: Number },
            transactions: [{
                date: { type: Date },
                branch: { type: String, enum: ['', 'OF CENTRA', 'PREFISIDO'] },
                description: { type: String },
                doc_number: { type: String },
                out: { type: Number },
                in: { type: Number },
                balance: { type: Number },
                id: { type: String }
            }]
        }]
    },
    income: {
        accounts: [IncomeAccountSchema] // Usar el esquema de IncomeAccount como un subdocumento
    }
});

