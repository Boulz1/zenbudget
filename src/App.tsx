// src/App.tsx
import { useLocalStorage } from './hooks/useLocalStorage';
import type { MainCategory, SubCategory, Transaction, BudgetRule, TransactionFormData, RecurringTransactionRule } from './types';
import type { CategoryFormData } from './components/AddCategoryModal';
import { v4 as uuidv4 } from 'uuid';
import { Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { toast } from 'sonner';
import { calculateFirstDueDate, calculateNextDueDate } from './utils/dateLogic'; // Déjà importé
import { generateTransactionsForRule } from './utils/transactionGenerator'; // Importer le générateur
import { parseISO, startOfDay } from 'date-fns'; // Pour la date actuelle

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
  const [recurringTransactionRules, setRecurringTransactionRules] = useLocalStorage<RecurringTransactionRule[]>('recurringTransactionRules', []);

  // --- FONCTIONS DE MISE À JOUR DE L'ÉTAT ---
  
  // Fonction pour ajouter une catégorie ou une sous-catégorie
  const handleAddCategory = (formData: CategoryFormData) => {
    if (formData.type === 'main') {
      const newMainCategory: MainCategory = {
        id: `cat-${uuidv4()}`,
        ...formData.data,
      };
      setMainCategories(prev => [...prev, newMainCategory]);
      toast.success(`Catégorie principale "${newMainCategory.name}" ajoutée.`);
    } else {
      const newSubCategory: SubCategory = {
        id: `sub-${uuidv4()}`,
        ...formData.data,
      };
      setSubCategories(prev => [...prev, newSubCategory]);
      toast.success(`Sous-catégorie "${newSubCategory.name}" ajoutée.`);
    }
  };

  // Fonction pour sauvegarder la règle budgétaire
  const handleSaveBudgetRule = (newRule: BudgetRule) => {
    setBudgetRule(newRule);
    // Notification gérée dans SettingsPage.tsx directement après la sauvegarde réussie
  };
  
  // Fonction pour ajouter une transaction
  const handleAddTransaction = (formData: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: `txn-${uuidv4()}`,
      ...formData,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success(`Transaction de ${newTransaction.amount.toFixed(2)}€ ajoutée.`);
  };

  // --- CRUD pour Catégories Principales ---
  const handleUpdateMainCategory = (id: string, data: Omit<MainCategory, 'id'>) => {
    setMainCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
    );
    toast.success(`Catégorie "${data.name}" mise à jour.`);
  };

  const handleDeleteMainCategory = (id: string) => {
    const categoryToDelete = mainCategories.find(cat => cat.id === id);
    setMainCategories(prev => prev.filter(cat => cat.id !== id));
    setSubCategories(prev => prev.filter(sub => sub.parentCategoryId !== id));
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.mainCategoryId === id) {
          return { ...tx, mainCategoryId: '', subCategoryId: undefined };
        }
        return tx;
      })
    );
    if (categoryToDelete) {
      toast.success(`Catégorie principale "${categoryToDelete.name}" et ses sous-catégories supprimées.`);
    }
  };

  // --- CRUD pour Sous-Catégories ---
  const handleUpdateSubCategory = (id: string, data: Omit<SubCategory, 'id'>) => {
    setSubCategories(prev =>
      prev.map(sub => sub.id === id ? { ...sub, ...data } : sub)
    );
    toast.success(`Sous-catégorie "${data.name}" mise à jour.`);
  };

  const handleDeleteSubCategory = (id: string) => {
    const subCategoryToDelete = subCategories.find(sub => sub.id === id);
    setSubCategories(prev => prev.filter(sub => sub.id !== id));
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.subCategoryId === id) {
          return { ...tx, subCategoryId: undefined };
        }
        return tx;
      })
    );
    if (subCategoryToDelete) {
      toast.success(`Sous-catégorie "${subCategoryToDelete.name}" supprimée.`);
    }
  };

  // --- CRUD pour Transactions ---
  const handleUpdateTransaction = (id: string, data: TransactionFormData) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...data, id } : tx)
    );
    toast.success(`Transaction de ${data.amount.toFixed(2)}€ mise à jour.`);
  };

  const handleDeleteTransaction = (id: string) => {
    const transactionToDelete = transactions.find(tx => tx.id === id);
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (transactionToDelete) {
      toast.success(`Transaction de ${transactionToDelete.amount.toFixed(2)}€ supprimée.`);
    }
  };

  // --- CRUD pour RecurringTransactionRule ---
  // Utiliser la logique de dateLogic.ts
  // calculateNextDueDate a été déplacé dans dateLogic.ts
  // calculateFirstDueDate est nouveau et sera utilisé dans handleAddRecurringRule.

  const handleAddRecurringRule = (
    ruleData: Omit<RecurringTransactionRule, 'id' | 'lastGeneratedDate' | 'nextDueDate' | 'isActive'>
  ) => {
    const newRule: RecurringTransactionRule = {
      id: `rec-${uuidv4()}`,
      ...ruleData,
      isActive: true,
      nextDueDate: calculateFirstDueDate( // Utiliser calculateFirstDueDate pour la première échéance
        ruleData.startDate,
        ruleData.frequency,
        ruleData.dayOfWeek,
        ruleData.dayOfMonth
      ),
      // lastGeneratedDate reste undefined initialement
    };
    setRecurringTransactionRules(prev => [...prev, newRule]);
    toast.success(`Règle récurrente "${newRule.name}" ajoutée.`);
  };

  const handleUpdateRecurringRule = (
    id: string,
    ruleData: Partial<Omit<RecurringTransactionRule, 'id'>> // Permet des mises à jour partielles
  ) => {
    let ruleNameForToast = '';
    setRecurringTransactionRules(prev =>
      prev.map(rule => {
        if (rule.id === id) {
          const updatedRule = { ...rule, ...ruleData };
          // Recalculer nextDueDate si les champs pertinents pour la date changent
          // Pour une mise à jour, on recalcule la *première* échéance si startDate change,
          // ou la *prochaine* échéance si d'autres paramètres de fréquence changent et que lastGeneratedDate existe.
          // Pour l'instant, on recalcule simplement la première échéance à partir de la nouvelle startDate
          // si startDate, frequency, ou interval (etc.) changent.
          // Une logique plus fine serait nécessaire si on veut préserver l'historique de génération.
          if (ruleData.startDate || ruleData.frequency || ruleData.interval || ruleData.dayOfWeek || ruleData.dayOfMonth) {
            updatedRule.nextDueDate = calculateFirstDueDate( // Recalculer comme si c'était une nouvelle règle
              updatedRule.startDate,
              updatedRule.frequency,
              // updatedRule.interval, // calculateFirstDueDate n'utilise pas interval directement
              updatedRule.dayOfWeek,
              updatedRule.dayOfMonth
            );
            // Lors d'un changement impactant la séquence, il est sage de réinitialiser lastGeneratedDate
            updatedRule.lastGeneratedDate = undefined;
          }
          ruleNameForToast = updatedRule.name;
          return updatedRule;
        }
        return rule;
      })
    );
    toast.success(`Règle récurrente "${ruleNameForToast || ruleData.name}" mise à jour.`);
  };

  const handleDeleteRecurringRule = (id: string) => {
    const ruleToDelete = recurringTransactionRules.find(r => r.id === id);
    setRecurringTransactionRules(prev => prev.filter(rule => rule.id !== id));
    if (ruleToDelete) {
      toast.success(`Règle récurrente "${ruleToDelete.name}" supprimée.`);
    }
  };

  // --- Logique de Génération des Transactions Récurrentes ---
  const processRecurringTransactions = () => {
    const today = startOfDay(new Date()); // Date limite pour la génération
    let anyRuleUpdated = false;
    let allGeneratedTransactions: Transaction[] = [];

    const updatedRules = recurringTransactionRules.map(rule => {
      if (!rule.isActive) {
        return rule; // Ne pas traiter les règles inactives
      }

      // La date de début de la vérification est la nextDueDate actuelle de la règle.
      // generateTransactionsForRule s'attend à ce que nextDueDate soit la première date à potentiellement générer.
      const { transactionsToCreate, newLastGeneratedDate, newNextDueDate } = generateTransactionsForRule(rule, today);

      if (transactionsToCreate.length > 0) {
        anyRuleUpdated = true;
        const newTransactionsWithIds: Transaction[] = transactionsToCreate.map(txData => ({
          ...txData,
          id: `txn-${uuidv4()}`, // Donner un ID unique à chaque transaction générée
          // On pourrait ajouter une réf à rule.id ici si on voulait les lier plus explicitement
        }));
        allGeneratedTransactions = [...allGeneratedTransactions, ...newTransactionsWithIds];

        return { ...rule, lastGeneratedDate: newLastGeneratedDate || rule.lastGeneratedDate, nextDueDate: newNextDueDate };
      }
      // Si aucune transaction n'est générée mais que nextDueDate a changé (par ex. si l'ancienne était dans le passé mais
      // que la nouvelle calculée est toujours dans le futur par rapport à 'today'), on met à jour la règle.
      // Cela arrive si la règle était en retard mais qu'aucune instance n'est due jusqu'à 'today'.
      if (newNextDueDate !== rule.nextDueDate) {
        anyRuleUpdated = true;
        return { ...rule, nextDueDate: newNextDueDate, lastGeneratedDate: newLastGeneratedDate || rule.lastGeneratedDate };
      }

      return rule;
    });

    if (allGeneratedTransactions.length > 0) {
      setTransactions(prev => [...allGeneratedTransactions, ...prev]); // Ajouter au début pour visibilité
      toast.info(`${allGeneratedTransactions.length} transaction(s) récurrente(s) générée(s).`);
    }

    if (anyRuleUpdated) {
      setRecurringTransactionRules(updatedRules);
    }
  };

  // TODO: Appeler processRecurringTransactions() dans un useEffect au montage,
  // et potentiellement à d'autres moments stratégiques.
  useEffect(() => {
    processRecurringTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Dépendances : Si on veut que ça tourne à chaque changement de règles ou de date (complexe),
    // il faudrait ajouter recurringTransactionRules. Pour l'instant, seulement au montage.
    // Si on le mettait, ça pourrait causer des boucles ou des exécutions trop fréquentes.
    // Une exécution au montage est un bon début.
  }, []); // Exécuter une seule fois au montage du composant App

  // --- RENDU DU COMPOSANT ---
  // Le composant App sert de conteneur pour le Layout et fournit les données via l'Outlet.
  return (
    <Layout>
      <Outlet context={{
        // Données et fonctions passées aux routes enfants via le 'context' de React Router
        mainCategories,
        subCategories,
        transactions,
        recurringTransactionRules, // Ajouté ici
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
        // CRUD Recurring Transactions
        onAddRecurringRule: handleAddRecurringRule,
        onUpdateRecurringRule: handleUpdateRecurringRule,
        onDeleteRecurringRule: handleDeleteRecurringRule,
      }} />
    </Layout>
  );
}

export default App;