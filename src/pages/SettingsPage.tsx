// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import type { BudgetRule } from '../types';
import { useAppContext } from '../components/Layout'; // Importer notre hook

// La page ne prend plus de props !
export function SettingsPage() {
  // On récupère les données et la fonction depuis le contexte
  const { budgetRule: currentRule, onSaveBudgetRule: onSave } = useAppContext();

  const [needs, setNeeds] = useState(currentRule.needs);
  const [wants, setWants] = useState(currentRule.wants);
  const [savings, setSavings] = useState(currentRule.savings);

  useEffect(() => {
    setNeeds(currentRule.needs);
    setWants(currentRule.wants);
    setSavings(currentRule.savings);
  }, [currentRule]);

  const total = needs + wants + savings;
  const isTotalOk = total === 100;

  const handleSave = () => {
    if (!isTotalOk) {
      alert('Le total des pourcentages doit être égal à 100.');
      return;
    }
    onSave({ needs, wants, savings });
    alert('Règle budgétaire enregistrée !');
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </header>
      
      <div className="max-w-lg mx-auto space-y-10">

        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Règle Budgétaire</h2>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <label htmlFor="needs" className="font-semibold">Besoins :</label>
              <div className="flex items-center gap-2">
                <input type="number" id="needs" value={needs} onChange={e => setNeeds(Number(e.target.value))} className="w-20 p-2 text-right rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <span>%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="wants" className="font-semibold">Envies :</label>
              <div className="flex items-center gap-2">
                <input type="number" id="wants" value={wants} onChange={e => setWants(Number(e.target.value))} className="w-20 p-2 text-right rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <span>%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="savings" className="font-semibold">Épargne :</label>
              <div className="flex items-center gap-2">
                <input type="number" id="savings" value={savings} onChange={e => setSavings(Number(e.target.value))} className="w-20 p-2 text-right rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <span>%</span>
              </div>
            </div>

            <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold ${isTotalOk ? 'text-green-500' : 'text-red-500'}`}>
              <span>Total :</span>
              <span>{total} % {isTotalOk ? '(OK)' : '(Doit faire 100%)'}</span>
            </div>

            <div className="text-center mt-6">
              <button onClick={handleSave} className="w-full sm:w-auto px-6 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!isTotalOk}>
                Enregistrer la Règle
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
           <h2 className="text-xl font-bold mb-4">Compte (Futur)</h2>
           <button className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-lg opacity-50 cursor-not-allowed">
             Se Déconnecter
           </button>
        </section>

      </div>
    </div>
  );
}