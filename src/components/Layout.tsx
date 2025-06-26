// src/components/Layout.tsx

import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import type { BudgetRule, MainCategory, SubCategory, Transaction, TransactionFormData } from "../types";
import type { CategoryFormData } from "./AddCategoryModal";

// Type du contexte que l'Outlet fournit aux pages enfants.
// Il définit toutes les données et fonctions partagées dans l'application.
export type AppContextType = {
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  transactions: Transaction[];
  onAddCategory: (data: CategoryFormData) => void;
  budgetRule: BudgetRule;
  onSaveBudgetRule: (newRule: BudgetRule) => void;
  onAddTransaction: (data: TransactionFormData) => void;
};

export function Layout({ children }: { children: React.ReactNode }) {
  // Fonction pour styliser les liens de navigation.
  // Elle applique des classes différentes si le lien est actif.
  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-slate-800 dark:text-white">
      <nav className="bg-white dark:bg-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-sky-500">MonBudget</span>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {/* On utilise NavLink pour une navigation côté client sans rechargement de page */}
                  <NavLink to="/" className={navLinkStyle}>TdB</NavLink>
                  <NavLink to="/transactions" className={navLinkStyle}>Transactions</NavLink>
                  <NavLink to="/categories" className={navLinkStyle}>Catégories</NavLink>
                  <NavLink to="/settings" className={navLinkStyle}>Paramètres</NavLink>
                </div>
              </div>
            </div>
            {/* Le bouton (+) mène maintenant au formulaire de nouvelle transaction */}
            <NavLink to="/transactions/new" className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white">
              (+)
            </NavLink>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* C'est ici que React Router rendra le composant de la page actuelle (CategoriesPage, etc.) */}
          {children}
        </div>
      </main>
    </div>
  );
}

// Hook personnalisé pour que les pages enfants puissent accéder facilement au contexte
// et bénéficier du typage fort de TypeScript.
export function useAppContext() {
  return useOutletContext<AppContextType>();
}