// src/utils/dashboardCalculations.ts
import { isSameMonth } from 'date-fns';
import type { Transaction, BudgetRule, MainCategory } from '../types';

export interface MonthlyData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budgetBreakdown: {
    needs: { budgeted: number; spent: number };
    wants: { budgeted: number; spent: number };
    savings: { budgeted: number; spent: number };
  };
  categorySpending: Array<{ name: string; amount: number }>;
}

export function calculateMonthlyData(
  transactions: Transaction[],
  budgetRule: BudgetRule,
  mainCategories: MainCategory[],
  selectedMonth: Date
): MonthlyData {
  const mainCategoryMap = new Map(mainCategories.map(cat => [cat.id, cat]));
  const monthlyTransactions = transactions.filter(tx => isSameMonth(new Date(tx.date), selectedMonth));

  const totalIncome = monthlyTransactions
    .filter(tx => tx.type === 'Revenu')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(tx => tx.type === 'Dépense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const budgetBreakdown = {
    needs: { budgeted: totalIncome * (budgetRule.needs / 100), spent: 0 },
    wants: { budgeted: totalIncome * (budgetRule.wants / 100), spent: 0 },
    savings: { budgeted: totalIncome * (budgetRule.savings / 100), spent: 0 },
  };

  const categorySpendingMap: Record<string, { name: string, amount: number }> = {};

  monthlyTransactions
    .filter(tx => tx.type === 'Dépense')
    .forEach(tx => {
      const category = mainCategoryMap.get(tx.mainCategoryId);
      if (category) {
        // Accumuler les dépenses par type de budget (Besoins, Envies, Épargne)
        switch (category.budgetType) {
          case 'Besoins': budgetBreakdown.needs.spent += tx.amount; break;
          case 'Envies': budgetBreakdown.wants.spent += tx.amount; break;
          case 'Épargne': budgetBreakdown.savings.spent += tx.amount; break;
          // Les revenus ne sont pas comptés dans les dépenses par budgetType ici
        }
        // Accumuler les dépenses par catégorie principale
        if (!categorySpendingMap[category.id]) {
          categorySpendingMap[category.id] = { name: category.name, amount: 0 };
        }
        categorySpendingMap[category.id].amount += tx.amount;
      }
    });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    budgetBreakdown,
    categorySpending: Object.values(categorySpendingMap).sort((a, b) => b.amount - a.amount),
  };
}
