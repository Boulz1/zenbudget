// src/components/BudgetProgressCard.tsx

interface BudgetProgressCardProps {
  title: string;
  percentageRule: number;
  budgeted: number;
  spent: number;
}

export function BudgetProgressCard({ title, percentageRule, budgeted, spent }: BudgetProgressCardProps) {
  const remaining = budgeted - spent;
  const spentPercentage = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;

  const progressBarColor = spentPercentage > 100 ? 'bg-red-500' : 'bg-sky-500';

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg">{title} ({percentageRule}%)</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          <p>Budget : {budgeted.toFixed(2)} €</p>
          <p>Dépensé : {spent.toFixed(2)} €</p>
        </div>
      </div>
      <div className="mt-4">
        <p className={`font-bold text-xl ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
          Reste : {remaining.toFixed(2)} €
        </p>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
          <div 
            className={`h-2.5 rounded-full ${progressBarColor}`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-right text-sm font-semibold mt-1">{spentPercentage}%</p>
      </div>
    </div>
  );
}