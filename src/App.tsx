// src/App.tsx

import { useLocalStorage } from './hooks/useLocalStorage';
import type { MainCategory, SubCategory, Transaction, BudgetRule, TransactionFormData } from './types';
import type { CategoryFormData } from './components/AddCategoryModal';
import { v4 as uuidv4 } from 'uuid';
import { Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';

// --- DONNÉES INITIALES ---
// Ces données sont utilisées uniquement si le localStorage est vide au premier lancement.
const initialMainCategories: MainCategory[] = [
  { id: 'cat-1', name: 'Logement', budgetType: 'Besoins' },
  { id: 'cat-2', name: 'Charges Fixes', budgetType: 'Besoins' },
  { id: 'cat-3', name: 'Loisirs & Culture', budgetType: 'Envies' },
  { id: 'cat-4', name: 'Salaires', budgetType: 'Revenu' },
  { id: 'cat-5', name: 'Santé', budgetType: 'Besoins' },
];

const initialSubCategories: SubCategory[] = [
  { id: 'sub-1', name: 'Loyer', parentCategoryId: 'cat-1' },
  { id: 'sub-2', name: 'Assurance Habitation', parentCategoryId: 'cat-1' },
  { id: 'sub-3', name: 'Électricité / Gaz', parentCategoryId: 'cat-2' },
  { id: 'sub-4', name: 'Internet', parentCategoryId: 'cat-2' },
  { id: 'sub-5', name: 'Restaurants / Bars', parentCategoryId: 'cat-3' },
];

const initialBudgetRule: BudgetRule = {
  needs: 50,
  wants: 30,
  savings: 20,
};

// --- COMPOSANT PRINCIPAL ---
function App() {
  // --- ÉTATS GLOBAUX DE L'APPLICATION ---
  const [mainCategories, setMainCategories] = useLocalStorage<MainCategory[]>('mainCategories', initialMainCategories);
  const [subCategories, setSubCategories] = useLocalStorage<SubCategory[]>('subCategories', initialSubCategories);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [budgetRule, setBudgetRule] = useLocalStorage<BudgetRule>('budgetRule', initialBudgetRule);

  // --- FONCTIONS DE MISE À JOUR DE L'ÉTAT ---
  
  // Fonction pour ajouter une catégorie ou une sous-catégorie
  const handleAddCategory = (formData: CategoryFormData) => {
    if (formData.type === 'main') {
      const newMainCategory: MainCategory = {
        id: `cat-${uuidv4()}`,
        ...formData.data,
      };
      setMainCategories(prev => [...prev, newMainCategory]);
    } else {
      const newSubCategory: SubCategory = {
        id: `sub-${uuidv4()}`,
        ...formData.data,
      };
      setSubCategories(prev => [...prev, newSubCategory]);
    }
  };

  // Fonction pour sauvegarder la règle budgétaire
  const handleSaveBudgetRule = (newRule: BudgetRule) => {
    setBudgetRule(newRule);
  };
  
  // Fonction pour ajouter une transaction
  const handleAddTransaction = (formData: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: `txn-${uuidv4()}`,
      ...formData,
    };
    // On ajoute la nouvelle transaction au début du tableau pour un affichage immédiat
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // --- CRUD pour Catégories Principales ---
  const handleUpdateMainCategory = (id: string, data: Omit<MainCategory, 'id'>) => {
    setMainCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
    );
  };

  // --- CRUD pour Sous-Catégories ---
  const handleUpdateSubCategory = (id: string, data: Omit<SubCategory, 'id'>) => {
    setSubCategories(prev =>
      prev.map(sub => sub.id === id ? { ...sub, ...data } : sub)
    );
  };

  const handleDeleteSubCategory = (id: string) => {
    setSubCategories(prev => prev.filter(sub => sub.id !== id));
    // Dé-catégoriser (seulement la sous-catégorie) les transactions liées
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.subCategoryId === id) {
          return { ...tx, subCategoryId: undefined };
        }
        return tx;
      })
    );
  };

  // --- CRUD pour Transactions ---
  const handleUpdateTransaction = (id: string, data: TransactionFormData) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...data, id } : tx) // Assurer que l'id est conservé
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // --- RENDU DU COMPOSANT ---
  // Le composant App sert de conteneur pour le Layout et fournit les données via l'Outlet.
  return (
    <Layout>
      <Outlet context={{
        // Données et fonctions passées aux routes enfants via le 'context' de React Router
        mainCategories,
        subCategories,
        transactions,
        onAddCategory: handleAddCategory,
        budgetRule,
        onSaveBudgetRule: handleSaveBudgetRule,
        onAddTransaction: handleAddTransaction,
        // CRUD Catégories Principales
        onUpdateMainCategory: handleUpdateMainCategory,
        onDeleteMainCategory: handleUpdateMainCategory,
        // CRUD Sous-Catégories
        onUpdateSubCategory: handleUpdateSubCategory,
        onDeleteSubCategory: handleDeleteSubCategory,
        // CRUD Transactions
        onUpdateTransaction: handleUpdateTransaction,
        onDeleteTransaction: handleDeleteTransaction,
      }} />
    </Layout>
  );
}

export default App;