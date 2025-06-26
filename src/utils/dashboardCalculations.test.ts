// src/utils/dashboardCalculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateMonthlyData } from './dashboardCalculations';
import type { Transaction, BudgetRule, MainCategory } from '../types';

describe('calculateMonthlyData', () => {
  const mockMainCategories: MainCategory[] = [
    { id: 'cat-needs', name: 'Logement', budgetType: 'Besoins' },
    { id: 'cat-wants', name: 'Loisirs', budgetType: 'Envies' },
    { id: 'cat-savings', name: 'Épargne Perso', budgetType: 'Épargne' },
    { id: 'cat-income', name: 'Salaire', budgetType: 'Revenu' },
  ];

  const mockBudgetRule: BudgetRule = {
    needs: 50, // 50%
    wants: 30, // 30%
    savings: 20, // 20%
  };

  const selectedMonth = new Date('2023-10-15'); // October 2023

  it('should return zero values for all fields if there are no transactions', () => {
    const transactions: Transaction[] = [];
    const result = calculateMonthlyData(transactions, mockBudgetRule, mockMainCategories, selectedMonth);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.budgetBreakdown.needs.budgeted).toBe(0);
    expect(result.budgetBreakdown.needs.spent).toBe(0);
    expect(result.budgetBreakdown.wants.budgeted).toBe(0);
    expect(result.budgetBreakdown.wants.spent).toBe(0);
    expect(result.budgetBreakdown.savings.budgeted).toBe(0);
    expect(result.budgetBreakdown.savings.spent).toBe(0);
    expect(result.categorySpending).toEqual([]);
  });

  it('should correctly calculate totals with only income transactions', () => {
    const transactions: Transaction[] = [
      { id: 't1', type: 'Revenu', amount: 2000, date: '2023-10-05', mainCategoryId: 'cat-income' },
      { id: 't2', type: 'Revenu', amount: 500, date: '2023-10-10', mainCategoryId: 'cat-income' },
      { id: 't3', type: 'Revenu', amount: 100, date: '2023-09-01', mainCategoryId: 'cat-income' }, // Different month
    ];
    const result = calculateMonthlyData(transactions, mockBudgetRule, mockMainCategories, selectedMonth);

    expect(result.totalIncome).toBe(2500);
    expect(result.totalExpenses).toBe(0);
    expect(result.balance).toBe(2500);
    expect(result.budgetBreakdown.needs.budgeted).toBe(1250); // 50% of 2500
    expect(result.budgetBreakdown.wants.budgeted).toBe(750);  // 30% of 2500
    expect(result.budgetBreakdown.savings.budgeted).toBe(500); // 20% of 2500
    expect(result.categorySpending).toEqual([]);
  });

  it('should correctly calculate totals and budget breakdown with mixed transactions', () => {
    const transactions: Transaction[] = [
      { id: 't-income', type: 'Revenu', amount: 3000, date: '2023-10-01', mainCategoryId: 'cat-income' },
      { id: 't-needs-1', type: 'Dépense', amount: 600, date: '2023-10-05', mainCategoryId: 'cat-needs' }, // Logement
      { id: 't-needs-2', type: 'Dépense', amount: 400, date: '2023-10-06', mainCategoryId: 'cat-needs' }, // Logement
      { id: 't-wants-1', type: 'Dépense', amount: 200, date: '2023-10-10', mainCategoryId: 'cat-wants' }, // Loisirs
      { id: 't-wants-2', type: 'Dépense', amount: 100, date: '2023-10-11', mainCategoryId: 'cat-wants' }, // Loisirs
      { id: 't-savings-1', type: 'Dépense', amount: 300, date: '2023-10-15', mainCategoryId: 'cat-savings' }, // Épargne Perso
      { id: 't-other-month', type: 'Dépense', amount: 50, date: '2023-09-20', mainCategoryId: 'cat-wants' },
    ];
    const result = calculateMonthlyData(transactions, mockBudgetRule, mockMainCategories, selectedMonth);

    expect(result.totalIncome).toBe(3000);
    expect(result.totalExpenses).toBe(600 + 400 + 200 + 100 + 300); // 1600
    expect(result.balance).toBe(3000 - 1600); // 1400

    // Budgeted amounts based on 3000 income
    expect(result.budgetBreakdown.needs.budgeted).toBe(1500); // 50%
    expect(result.budgetBreakdown.wants.budgeted).toBe(900);  // 30%
    expect(result.budgetBreakdown.savings.budgeted).toBe(600); // 20%

    // Spent amounts
    expect(result.budgetBreakdown.needs.spent).toBe(1000); // 600 + 400
    expect(result.budgetBreakdown.wants.spent).toBe(300);  // 200 + 100
    expect(result.budgetBreakdown.savings.spent).toBe(300);

    expect(result.categorySpending).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Logement', amount: 1000 }),
        expect.objectContaining({ name: 'Loisirs', amount: 300 }),
        expect.objectContaining({ name: 'Épargne Perso', amount: 300 }),
      ])
    );
    expect(result.categorySpending.length).toBe(3);
    // Check sorting (highest spending first)
    expect(result.categorySpending[0].name).toBe('Logement');
  });

  it('should handle transactions with mainCategoryId not in mainCategories (as uncategorized for spending)', () => {
    const transactions: Transaction[] = [
      { id: 't-income', type: 'Revenu', amount: 1000, date: '2023-10-01', mainCategoryId: 'cat-income' },
      { id: 't-unknown', type: 'Dépense', amount: 100, date: '2023-10-05', mainCategoryId: 'cat-unknown' },
    ];
    const result = calculateMonthlyData(transactions, mockBudgetRule, mockMainCategories, selectedMonth);

    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpenses).toBe(100); // Still counts as an expense
    expect(result.balance).toBe(900);
    // Budget breakdown for needs, wants, savings spent should be 0 as 'cat-unknown' is not mapped to a budgetType
    expect(result.budgetBreakdown.needs.spent).toBe(0);
    expect(result.budgetBreakdown.wants.spent).toBe(0);
    expect(result.budgetBreakdown.savings.spent).toBe(0);
    // categorySpending should be empty as 'cat-unknown' is not in mockMainCategories
    expect(result.categorySpending).toEqual([]);
  });

  it('should correctly sum expenses even if budgetType is Revenu (edge case, should not happen with UI logic)', () => {
    // This tests if an expense is mistakenly categorized under a 'Revenu' budgetType category.
    // The current UI prevents this, but the calculation function should still sum it as an expense.
     const transactions: Transaction[] = [
      { id: 't-income', type: 'Revenu', amount: 1000, date: '2023-10-01', mainCategoryId: 'cat-income' },
      { id: 't-expense-on-income-cat', type: 'Dépense', amount: 50, date: '2023-10-05', mainCategoryId: 'cat-income' },
    ];
    const result = calculateMonthlyData(transactions, mockBudgetRule, mockMainCategories, selectedMonth);

    expect(result.totalExpenses).toBe(50);
    // The expense on 'cat-income' (budgetType 'Revenu') should not be added to needs, wants, or savings 'spent'
    expect(result.budgetBreakdown.needs.spent).toBe(0);
    expect(result.budgetBreakdown.wants.spent).toBe(0);
    expect(result.budgetBreakdown.savings.spent).toBe(0);
    // It should appear in categorySpending though
    expect(result.categorySpending).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Salaire', amount: 50 }),
      ])
    );
  });
});
