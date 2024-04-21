// src/finance/finance.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validate, ValidationError } from 'class-validator';
import { Model } from 'mongoose';
import { FloidAccountWidgetDto } from './dto/floid-widget.dto';
import { FinanceSummary } from './interfaces/finance-summary.interface';
import { FloidAccountWidgetModel } from './models/floid-account-widget.interface';


const categories = {
    'Alimentos': ['supermercado', 'restaurante', 'café'],
    'Transporte': ['gasolina', 'uber', 'taxi', 'metro'],
    'Hogar': ['alquiler', 'hipoteca', 'muebles'],
    'Salud': ['doctor', 'clínica', 'hospital', 'farmacia'],
    'Deuda': ['credito'],
    // Añade más categorías según sea necesario
    'No Categorizado': []
};

@Injectable()
export class FinanceService {
    constructor(@InjectModel('FloidAccountWidget') private readonly floidWidgetModel: Model<FloidAccountWidgetModel>,) { }

    async createAccountFloidWidget(createFloidAccount: FloidAccountWidgetDto): Promise<FloidAccountWidgetModel> {
        try {
            const errors = await this.validateDto(createFloidAccount);
            if (errors.length > 0) {
                const errorMessage = this.formatValidationError(errors);
                throw new BadRequestException(`Validation failed: ${errorMessage}`);
            }

            await this.isConsumerIsUnique(createFloidAccount.consumerId);

            // Correctly access the transactions and categorize them
            createFloidAccount.transactions.accounts.forEach(accountTransaction => {
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
            throw new BadRequestException(error.message);
        }
    }

    private async validateDto(dto: FloidAccountWidgetDto): Promise<string[]> {
        const errors = [];
        if (!dto.consumerId) {
            errors.push('consumerId is required');
        }
        // Add more validations as needed
        return errors;
    }

    private formatValidationError(errors: string[]): string {
        return errors.join(', ');
    }

    private async isConsumerIsUnique(consumerId: string): Promise<void> {
        const existingAccount = await this.floidWidgetModel.findOne({ consumerId });
        if (existingAccount) {
            throw new Error('Consumer ID already exists');
        }
    }


    private categorizeTransaction(description: string): string {
        // Convert description to lowercase for case-insensitive comparison
        const lowerCaseDescription = description.toLowerCase();

        // Iterate over each category to find a matching keyword
        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (lowerCaseDescription.includes(keyword)) {
                    return category;
                }
            }
        }

        // Return 'No Categorizado' if no keywords match
        return 'No Categorizado';
    }

    async getFinancialSummary(): Promise<FinanceSummary> {
        const allAccounts = await this.floidWidgetModel.find();
        let totalBalance = 0;
        let totalIncome = 0;
        let totalExpenses = 0;
        let accountCount = allAccounts.length;

        allAccounts.forEach(account => {
            account.products.accounts.forEach(acc => {
                totalBalance += acc.balance;
            });

            account.transactions.accounts.forEach(accountTrans => {
                accountTrans.transactions.forEach(transaction => {
                    if (this.isCurrentMonth(new Date(transaction.date))) {
                        if (transaction.in > 0) {
                            totalIncome += transaction.in;
                        }
                        if (transaction.out > 0) {
                            totalExpenses += transaction.out;
                        }
                    }
                });
            });
        });

        const averageBalance = totalBalance / accountCount;
        const averageIncome = totalIncome / accountCount;
        const averageExpenses = totalExpenses / accountCount;

        return {
            totalBalance,
            totalIncome,
            totalExpenses,
            average: {
                averageBalance,
                averageIncome,
                averageExpenses
            }
        };
    }

    private isCurrentMonth(date: Date): boolean {
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
}
