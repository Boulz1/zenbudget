// src/types/index.ts

export type BudgetType = 'Besoins' | 'Envies' | 'Épargne' | 'Revenu';

export interface MainCategory {
  id: string;
  name: string;
  budgetType: BudgetType;
}

export interface SubCategory {
  id:string;
  name: string;
  parentCategoryId: string;
}

export interface Transaction {
  id: string;
  type: 'Dépense' | 'Revenu';
  amount: number;
  date: string; // Format YYYY-MM-DD
  mainCategoryId: string;
  subCategoryId?: string;
  note?: string;
}

export interface BudgetRule {
  needs: number;
  wants: number;
  savings: number;
}

// On ajoute le type pour la fonction d'ajout de transaction
export type TransactionFormData = Omit<Transaction, 'id'>;