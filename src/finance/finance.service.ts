import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { catchError, map, tap } from 'rxjs';
import { UserCredentialDto } from './dto/floid-credential.dto';
import { FloidAccountWidgetDto } from './dto/floid-widget.dto';
import { IFloidAccountWidget, IAccount, ITransaction } from './models/floid-account-summary';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';

const categoriesMap = {
    'Alimentos': ['supermercado', 'restaurante', 'café'],
    'Transporte': ['gasolina', 'uber', 'taxi', 'metro'],
    'Hogar': ['alquiler', 'hipoteca', 'muebles'],
    'Salud': ['doctor', 'clínica', 'hospital', 'farmacia'],
    'Deuda': ['credito'],
    'Seguros': ['desgravamen'],
    'No Categorizado': []
};

@Injectable()
export class FinanceService {
    constructor(
        private httpService: HttpService,
        @InjectModel('FloidAccountWidget') private readonly floidWidgetModel: Model<IFloidAccountWidget>,
        @InjectModel('Account') private readonly accountModel: Model<IAccount>,
        @InjectModel('Transaction') private readonly transactionModel: Model<ITransaction>
    ) { }

    async createAccountFloidWidget(createFloidAccount: FloidAccountWidgetDto): Promise<IFloidAccountWidget> {
        try {

            if (!createFloidAccount.consumerId) {
                throw new BadRequestException('Validation failed: consumerId is required');
            }

            const existingAccount = await this.floidWidgetModel.findOne({ consumerId: createFloidAccount.consumerId });
            if (existingAccount) {
                throw new BadRequestException('Consumer ID already exists');
            }

            createFloidAccount.transactions.accounts.forEach((accountTransaction: { account_number: number; transactions: any[] }) => {
                accountTransaction.transactions.forEach(transaction => {
                    transaction.category = this.categorizeTransaction(transaction.description);
                });
            });

            const account = new this.floidWidgetModel(createFloidAccount);
            const savedAccount = await account.save();
            console.log('Account successfully created:', savedAccount);

            return savedAccount;
        } catch (error) {
            console.error('Error creating Floid account:', error);
            throw error instanceof BadRequestException ? error : new BadRequestException(error.message);
        }
    }

    async getProductsForAccount(
        userId: string,
        account: string,
        tokenPassword: string,
        bank: string
    ) {
        const callbackUrl = `${process.env.API_URL}/finance/receive-data`;

        try {
            // Realizar la petición inicial al widget de Floid
            const widgetResponse = await this.httpService.post(
                'https://sandbox.floid.app/cl/widget/get',
                {
                    token_password: tokenPassword,
                    type: 'banks',
                    environment: 'sandbox',
                    callbackUrl: callbackUrl
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.FLOID_TOKEN}`
                    }
                }
            ).toPromise();

            // Obtener el case ID de la respuesta del widget
            const caseId = widgetResponse.data.caseid;

            // Realizar la petición para obtener los datos de transacciones
            const transactionsResponse = await this.httpService.post(
                `https://sandbox.floid.app/cl/banco_${bank}_personas/transactions`,
                {
                    token_password: tokenPassword,
                    id: userId,
                    account: account,
                    callbackUrl: callbackUrl
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.FLOID_TOKEN}`
                    }
                }
            ).toPromise();

            // Devolver una respuesta inicial
            return {
                caseId: caseId,
                widgetResponse: widgetResponse.data,
                transactionsResponse: transactionsResponse.data
            };
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            throw error;
        }
    }



    getTransacctionsForAccount(
        userId: string,
        account: string,
        tokenPassword: string,
        bank: string
    ): Observable<AxiosResponse> {
        const url = `https://sandbox.floid.app/cl/banco_${bank}_personas/transactions`;

        console.log('Enviando petición a Floid:', {
            url,
            account,
            bank
        });

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLOID_TOKEN}`,
        };

        const transactionsCallbackUrl = `${process.env.API_URL}/finance/transactions-callback`;
        const body = {
            token_password: tokenPassword,
            id: userId,
            account: account,
            callbackUrl: transactionsCallbackUrl
        };
        console.log('Body de la petición:', JSON.stringify(body, null, 2));

        return this.httpService.post(url, body, { headers }).pipe(
            tap(response => {
                console.log('Respuesta completa de Floid:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data
                });
            }),
            map(response => response.data),
            catchError(error => {
                console.error('Error detallado:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                throw new HttpException(
                    error.response?.data?.display_message || 'Error processing request',
                    error.response?.status || HttpStatus.BAD_REQUEST
                );
            })
        );
    }

    async processWidgetData(widgetData: any) {
        // Implementa la lógica para procesar los datos del widget
        console.log('Procesando datos del widget:', widgetData);
        // Por ejemplo, podrías guardar estos datos en tu base de datos
    }


    public processTransactionData(data: any): any[] {
        // Extraer la información relevante de las transacciones
        const transactions = data.transactions.map(transaction => ({
            id: transaction.id,
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
            currency: transaction.currency
        }));

        // Realizar cualquier otra transformación o análisis necesario
        const processedTransactions = this.analyzeTransactions(transactions);

        return processedTransactions;
    }

    private analyzeTransactions(transactions: any[]): any[] {
        // Define the type for the transactionTotals object
        interface TransactionTotals {
            [currency: string]: {
                total: number;
                count: number;
            };
        }

        // Perform the analysis on the transactions
        const transactionTotals: TransactionTotals = transactions.reduce((totals, transaction) => {
            if (!totals[transaction.currency]) {
                totals[transaction.currency] = { total: 0, count: 0 };
            }
            totals[transaction.currency].total += transaction.amount;
            totals[transaction.currency].count++;
            return totals;
        }, {});

        // Transform the totals object into an array
        return Object.entries(transactionTotals).map(([currency, total]) => ({
            currency,
            total: total.total,
            count: total.count
        }));
    }

    async getFinancialSummaryForUser(userId: string): Promise<any> {
        try {
            console.log(`Buscando resumen financiero para el usuario con ID: ${userId}`);

            // Buscar la información de FloidAccountWidget del usuario
            const accountsInfo = await this.floidWidgetModel.findOne({ userId: userId }).exec();
            if (!accountsInfo) {
                console.log('No se encontró información para el usuario.');
                return { userId: userId, creditcards: [], financialSummary: [] };
            }

            console.log(`Información encontrada para el usuario: ${accountsInfo}`);

            // Procesar la información de las cuentas
            const financialSummary = await this.processAccounts(accountsInfo);
            console.log('Resúmenes financieros generados para todas las cuentas.');

            // Procesar la información de las tarjetas
            const creditcards = await this.processCards(accountsInfo);
            console.log('Resúmenes financieros generados para todas las cuentas.');

            return { userId, creditcards, financialSummary };
        } catch (error) {
            console.error(`Error al recuperar el resumen financiero para el usuario ${userId}:`, error);
            throw new Error('Failed to retrieve financial summary');
        }
    }

    private async processAccounts(accountsInfo: IFloidAccountWidget): Promise<any[]> {
        const financialSummary: any[] = [];

        // Recorrer las cuentas
        accountsInfo.transactions.accounts.forEach(account => {
            console.log(account)
            const accountSummary: any = {
                accountId: account.account_number,
                balance: this.calculateAverageBalance(account.transactions),
                totalIncome: this.calculateTotalIncome(account.transactions),
                totalExpenses: this.calculateTotalExpenses(account.transactions),
                averageIncome: this.calculateAverageIncome(account.transactions),
                averageExpenses: this.calculateAverageExpenses(account.transactions),
                categories: this.categorizeExpenses(account.transactions)
            };
            financialSummary.push(accountSummary);
        });

        return financialSummary;
    }

    private async processCards(accountsInfo: IFloidAccountWidget): Promise<any[]> {
        const cardsAccount: any[] = [];

        // Recorrer las cuentas
        accountsInfo.products.cards.forEach(card => {
            console.log(card)
            const cardInfo: any = {
                name: card.name,
                number: card.number,
                currency: card.currency,
                total: card.total,
                used: card.used,
                available: card.available,
            };
            cardsAccount.push(cardInfo);
        });

        return cardsAccount;
    }

    private calculateTotalIncome(transactions: ITransaction[]): number {
        return transactions.reduce((total, transaction) => total + (transaction.in || 0), 0);
    }

    private calculateTotalExpenses(transactions: ITransaction[]): number {
        return transactions.reduce((total, transaction) => total + (transaction.out || 0), 0);
    }

    private calculateAverageBalance(transactions: ITransaction[]): number {
        if (transactions.length === 0) return 0;

        let lastBalancePerDay: { [key: string]: number } = {};
        let balanceStart = transactions[0].balance + transactions[0].in - transactions[0].out; // Saldo inicial estimado

        transactions.forEach(transaction => {
            const dateString = transaction.date.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

            if (!lastBalancePerDay[dateString]) {
                lastBalancePerDay[dateString] = balanceStart; // Establece el saldo inicial del día
            }

            // Actualiza el saldo al final del día considerando transacciones
            lastBalancePerDay[dateString] = transaction.balance;
        });

        const dailyBalances = Object.values(lastBalancePerDay);
        const totalBalance = dailyBalances.reduce((total, balance) => total + balance, 0);

        return totalBalance / dailyBalances.length; // Promedio de saldos diarios
    }


    private calculateAverageIncome(transactions: ITransaction[]): number {
        const totalIncome = this.calculateTotalIncome(transactions);
        return totalIncome / 12; // Assuming the information is for one year
    }

    private calculateAverageExpenses(transactions: ITransaction[]): number {
        const totalExpenses = this.calculateTotalExpenses(transactions);
        return totalExpenses / 12; // Assuming the information is for one year
    }


    private categorizeExpenses(transactions: ITransaction[]): any {
        const categories: any = {};

        transactions.forEach(transaction => {
            const category = transaction.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(transaction);
        });

        return categories;
    }


    private categorizeTransaction(description: string): string {
        if (!description) return 'No Categorizado';

        const lowerDescription = description.toLowerCase();
        const category = Object.keys(categoriesMap).find(category =>
            categoriesMap[category].some(keyword => lowerDescription.includes(keyword))
        );

        return category || 'No Categorizado';
    }
}
