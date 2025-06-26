// src/pages/SettingsPage.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { BudgetRule } from '../types';
import { useAppContext } from '../components/Layout';

type FormValues = BudgetRule;

export function SettingsPage() {
  const { budgetRule: currentRule, onSaveBudgetRule } = useAppContext();

  const { register, handleSubmit, watch, reset, formState: { errors, isValid, isDirty } } = useForm<FormValues>({
    defaultValues: currentRule,
    mode: 'onChange', // Pour que `isValid` se mette à jour dynamiquement
  });

  useEffect(() => {
    reset(currentRule); // Synchroniser si currentRule change (ex: depuis localStorage au 1er chargement)
  }, [currentRule, reset]);

  const watchedNeeds = watch('needs');
  const watchedWants = watch('wants');
  const watchedSavings = watch('savings');

  const totalPercentage = (Number(watchedNeeds) || 0) + (Number(watchedWants) || 0) + (Number(watchedSavings) || 0);
  const isTotalOk = totalPercentage === 100;

  const onSubmit = (data: FormValues) => {
    if (!isTotalOk) {
      // Bien que le bouton soit désactivé, une sécurité supplémentaire
      alert('Le total des pourcentages doit être égal à 100.');
      return;
    }
    onSaveBudgetRule({
        needs: Number(data.needs),
        wants: Number(data.wants),
        savings: Number(data.savings),
    });
    alert('Règle budgétaire enregistrée !'); // Sera remplacé par une notification
  };

  const validatePercentage = (value: number | string) => {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) {
      return "Doit être entre 0 et 100";
    }
    return true;
  };


  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </header>
      
      <div className="max-w-lg mx-auto space-y-10">
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Règle Budgétaire</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {[
              { name: 'needs', label: 'Besoins' },
              { name: 'wants', label: 'Envies' },
              { name: 'savings', label: 'Épargne' },
            ].map(field => (
              <div key={field.name}>
                <div className="flex items-center justify-between">
                  <label htmlFor={field.name} className="font-semibold">{field.label} :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      id={field.name}
                      {...register(field.name as keyof FormValues, {
                        required: "Requis",
                        valueAsNumber: true,
                        validate: validatePercentage
                      })}
                      className={`w-20 p-2 text-right rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors[field.name as keyof FormValues] ? 'ring-red-500' : 'focus:ring-sky-500'}`}
                    />
                    <span>%</span>
                  </div>
                </div>
                {errors[field.name as keyof FormValues] && <p className="text-red-500 text-xs mt-1 text-right">{errors[field.name as keyof FormValues]?.message}</p>}
              </div>
            ))}

            <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold ${isTotalOk ? 'text-green-500' : 'text-red-500'}`}>
              <span>Total :</span>
              <span>{totalPercentage} % {isTotalOk ? '(OK)' : `(Doit faire 100%, ${100-totalPercentage}% restant)`}</span>
            </div>
             {/* Message d'erreur global si le total n'est pas 100 */}
            {!isTotalOk && <p className="text-red-500 text-sm text-center mt-2">Le total des pourcentages doit être égal à 100% pour pouvoir enregistrer.</p>}


            <div className="text-center mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isTotalOk || !isValid || !isDirty } // Désactivé si total pas OK, ou formulaire invalide, ou pas de modifs
              >
                Enregistrer la Règle
              </button>
            </div>
          </form>
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