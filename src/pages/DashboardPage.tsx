// src/pages/DashboardPage.tsx
import { useState, useMemo } from 'react';
import { useAppContext } from '../components/Layout';
import { addMonths, subMonths, format, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const { transactions, budgetRule, mainCategories } = useAppContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const mainCategoryMap = useMemo(() => new Map(mainCategories.map(cat => [cat.id, cat])), [mainCategories]);

  // --- LOGIQUE DE CALCUL (optimisée avec useMemo) ---
  const monthlyData = useMemo(() => {
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
    
    const categorySpending: Record<string, { name: string, amount: number }> = {};

    monthlyTransactions
      .filter(tx => tx.type === 'Dépense')
      .forEach(tx => {
        const category = mainCategoryMap.get(tx.mainCategoryId);
        if (category) {
          switch (category.budgetType) {
            case 'Besoins': budgetBreakdown.needs.spent += tx.amount; break;
            case 'Envies': budgetBreakdown.wants.spent += tx.amount; break;
            case 'Épargne': budgetBreakdown.savings.spent += tx.amount; break;
          }
          if (!categorySpending[category.id]) {
            categorySpending[category.id] = { name: category.name, amount: 0 };
          }
          categorySpending[category.id].amount += tx.amount;
        }
      });

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      budgetBreakdown,
      categorySpending: Object.values(categorySpending).sort((a,b) => b.amount - a.amount),
    };
  }, [transactions, selectedMonth, budgetRule, mainCategoryMap]);

  // --- Fonctions de navigation de date ---
  const handlePreviousMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));

  // --- Données pour le graphique ---
  const pieChartData = monthlyData.categorySpending.map(cat => ({
    name: cat.name,
    value: cat.amount
  }));
  const COLORS = ['#0ea5e9', '#f97316', '#84cc16', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex justify-center items-center gap-4">
        <button onClick={handlePreviousMonth} className="text-2xl p-2 hover:bg-slate-700 rounded-full">&lt;</button>
        <h2 className="text-2xl font-bold w-48 text-center capitalize">{format(selectedMonth, 'MMMM yyyy', { locale: fr })}</h2>
        <button onClick={handleNextMonth} className="text-2xl p-2 hover:bg-slate-700 rounded-full">{'>'}</button>
      </div>

      {/* Résumé principal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-green-500/20 p-4 rounded-lg"><span className="block text-sm">Revenu</span><span className="font-bold text-2xl">{monthlyData.totalIncome.toFixed(2)}€</span></div>
        <div className="bg-red-500/20 p-4 rounded-lg"><span className="block text-sm">Dépenses</span><span className="font-bold text-2xl">{monthlyData.totalExpenses.toFixed(2)}€</span></div>
        <div className="bg-sky-500/20 p-4 rounded-lg"><span className="block text-sm">Solde</span><span className="font-bold text-2xl">{monthlyData.balance.toFixed(2)}€</span></div>
      </div>
      
      {/* Cartes de progression du budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetProgressCard title="Besoins" percentageRule={budgetRule.needs} {...monthlyData.budgetBreakdown.needs} />
        <BudgetProgressCard title="Envies" percentageRule={budgetRule.wants} {...monthlyData.budgetBreakdown.wants} />
        <BudgetProgressCard title="Épargne" percentageRule={budgetRule.savings} {...monthlyData.budgetBreakdown.savings} />
      </div>

      {/* Section des graphiques et dépenses par catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-4">Répartition des Dépenses</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {pieChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">Pas de dépenses à afficher.</div>
          )}
        </div>
        {/* Dépenses par Catégorie */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-4">Dépenses par Catégorie</h3>
          <ul className="space-y-2">
            {monthlyData.categorySpending.map(cat => (
              <li key={cat.name} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                <span>{cat.name}</span>
                <span className="font-semibold">{cat.amount.toFixed(2)} €</span>
              </li>
            ))}
             {monthlyData.categorySpending.length === 0 && <li className="text-center text-gray-500 p-4">Aucune dépense ce mois-ci.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}