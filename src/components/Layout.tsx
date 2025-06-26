// src/components/Layout.tsx

import { useState } from "react"; // Ajout de useState
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { Toaster } from 'sonner'; // Import Toaster
import type { BudgetRule, MainCategory, SubCategory, Transaction, TransactionFormData, RecurringTransactionRule } from "../types"; // Added RecurringTransactionRule
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
  // CRUD Catégories Principales
  onUpdateMainCategory: (id: string, data: Omit<MainCategory, 'id'>) => void;
  onDeleteMainCategory: (id: string) => void;
  // CRUD Sous-Catégories
  onUpdateSubCategory: (id: string, data: Omit<SubCategory, 'id'>) => void;
  onDeleteSubCategory: (id: string) => void;
  // CRUD Transactions
  onUpdateTransaction: (id: string, data: TransactionFormData) => void;
  onDeleteTransaction: (id: string) => void;
  // CRUD RecurringTransactionRule
  recurringTransactionRules: RecurringTransactionRule[];
  onAddRecurringRule: (ruleData: Omit<RecurringTransactionRule, 'id' | 'lastGeneratedDate' | 'nextDueDate' | 'isActive'>) => void;
  onUpdateRecurringRule: (id: string, ruleData: Partial<Omit<RecurringTransactionRule, 'id'>>) => void;
  onDeleteRecurringRule: (id: string) => void;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fonction pour styliser les liens de navigation (version bureau).
  const navLinkStyleDesktop = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white'
    }`;

  // Fonction pour styliser les liens de navigation (version mobile).
  const navLinkStyleMobile = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white'
    }`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-slate-800 dark:text-white">
      <nav className="bg-white dark:bg-slate-800 shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Section gauche: Logo et liens bureau */}
            <div className="flex items-center">
              <NavLink to="/" className="font-bold text-xl text-sky-500" onClick={closeMobileMenu}>
                MonBudget
              </NavLink>
              {/* Liens pour écran large (md et plus) */}
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <NavLink to="/" className={navLinkStyleDesktop} onClick={closeMobileMenu}>TdB</NavLink>
                  <NavLink to="/transactions" className={navLinkStyleDesktop} onClick={closeMobileMenu}>Transactions</NavLink>
                  <NavLink to="/recurring" className={navLinkStyleDesktop} onClick={closeMobileMenu}>Récurrentes</NavLink>
                  <NavLink to="/categories" className={navLinkStyleDesktop} onClick={closeMobileMenu}>Catégories</NavLink>
                  <NavLink to="/settings" className={navLinkStyleDesktop} onClick={closeMobileMenu}>Paramètres</NavLink>
                </div>
              </div>
            </div>

            {/* Section droite: Bouton (+) et Menu Hamburger */}
            <div className="flex items-center">
              <NavLink
                to="/transactions/new"
                className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                onClick={closeMobileMenu}
                aria-label="Ajouter une nouvelle transaction"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </NavLink>

              {/* Bouton Hamburger pour écrans md et moins */}
              <div className="ml-4 md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-label={isMobileMenuOpen ? "Fermer le menu principal" : "Ouvrir le menu principal"}
                >
                  <span className="sr-only">{isMobileMenuOpen ? "Fermer menu" : "Ouvrir menu"}</span>
                  {/* Icône Hamburger ou X */}
                  {isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white dark:bg-slate-800 shadow-lg rounded-b-md" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/" className={navLinkStyleMobile} onClick={closeMobileMenu}>TdB</NavLink>
              <NavLink to="/transactions" className={navLinkStyleMobile} onClick={closeMobileMenu}>Transactions</NavLink>
              <NavLink to="/recurring" className={navLinkStyleMobile} onClick={closeMobileMenu}>Récurrentes</NavLink>
              <NavLink to="/categories" className={navLinkStyleMobile} onClick={closeMobileMenu}>Catégories</NavLink>
              <NavLink to="/settings" className={navLinkStyleMobile} onClick={closeMobileMenu}>Paramètres</NavLink>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10"> {/* Assurer que le contenu principal est sous la nav si le menu est grand */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Toaster richColors position="top-right" /> {/* Ajout du Toaster ici */}
    </div>
  );
}

// Hook personnalisé pour que les pages enfants puissent accéder facilement au contexte
// et bénéficier du typage fort de TypeScript.
export function useAppContext() {
  return useOutletContext<AppContextType>();
}