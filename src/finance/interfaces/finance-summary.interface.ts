export interface FinanceSummary {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    average: {
        averageBalance: number;
        averageIncome: number;
        averageExpenses: number;
    };
}
