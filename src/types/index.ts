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

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransactionRule {
  id: string;
  name: string; // Un nom pour identifier la règle, ex: "Loyer", "Salaire Netflix"
  type: 'Dépense' | 'Revenu';
  amount: number;
  mainCategoryId: string;
  subCategoryId?: string;
  note?: string;

  frequency: Frequency;
  interval: number; // Ex: tous les X jours/semaines/mois/ans
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optionnel

  // Champs spécifiques à la fréquence (optionnels selon la fréquence)
  dayOfWeek?: number; // 0 (Dimanche) à 6 (Samedi) - pour 'weekly'
  dayOfMonth?: number; // 1 à 31 - pour 'monthly', 'yearly'
  // monthOfYear?: number; // 0 (Jan) à 11 (Dec) - pour 'yearly' (si on veut un mois spécifique pour une règle annuelle)

  lastGeneratedDate?: string; // YYYY-MM-DD, dernière fois qu'une transaction a été générée pour cette règle
  nextDueDate: string; // YYYY-MM-DD, prochaine échéance calculée
  isActive: boolean; // Pour pouvoir désactiver une règle sans la supprimer
}