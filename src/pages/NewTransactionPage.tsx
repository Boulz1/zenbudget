// src/pages/NewTransactionPage.tsx
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from '../components/Layout';
import type { TransactionFormData } from '../types';

type FormValues = {
  type: 'Dépense' | 'Revenu';
  amount: number;
  date: string;
  mainCategoryId: string;
  subCategoryId?: string;
  note?: string;
};

export function NewTransactionPage() {
  const { mainCategories, subCategories, onAddTransaction } = useAppContext();
  const navigate = useNavigate();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      type: 'Dépense',
      date: new Date().toISOString().split('T')[0],
      amount: undefined, // For placeholder to show
      mainCategoryId: '',
      subCategoryId: '',
      note: '',
    }
  });

  const watchedType = watch('type');
  const watchedMainCategoryId = watch('mainCategoryId');

  // Filtrer les catégories principales disponibles en fonction du type de transaction
  const availableMainCategories = useMemo(() =>
    mainCategories.filter(cat => {
      if (watchedType === 'Dépense') {
        return cat.budgetType !== 'Revenu';
      }
      return cat.budgetType === 'Revenu';
    }),
    [mainCategories, watchedType]
  );

  // Filtrer les sous-catégories disponibles en fonction de la catégorie principale choisie
  const availableSubCategories = useMemo(() =>
    subCategories.filter(sub => sub.parentCategoryId === watchedMainCategoryId),
    [subCategories, watchedMainCategoryId]
  );

  // Réinitialiser mainCategoryId si le type change et que la catégorie sélectionnée n'est plus valide
  useEffect(() => {
    if (!availableMainCategories.find(cat => cat.id === watchedMainCategoryId)) {
      setValue('mainCategoryId', '');
    }
  }, [availableMainCategories, watchedMainCategoryId, setValue]);

  // Réinitialiser subCategoryId si mainCategoryId change et que la sous-catégorie sélectionnée n'est plus valide
  useEffect(() => {
    if (!availableSubCategories.find(sub => sub.id === watch('subCategoryId'))) {
      setValue('subCategoryId', '');
    }
  }, [availableSubCategories, watchedMainCategoryId, setValue, watch]);


  const onSubmit = (data: FormValues) => {
    const transactionData: TransactionFormData = {
      ...data,
      amount: Number(data.amount), // Assurer que amount est un nombre
      subCategoryId: data.subCategoryId || undefined,
      note: data.note || undefined,
    };
    onAddTransaction(transactionData);
    navigate('/transactions');
  };

  return (
    <div>
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-2xl hover:text-sky-500">←</button>
        <h1 className="text-3xl font-bold">Nouvelle Transaction</h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md space-y-4">
        
        <div>
          <span className="text-sm font-medium">Type:</span>
          {/* Utilisation de Controller pour les boutons de type car ce n'est pas un input natif */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="mt-2 flex gap-4 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <button type="button" onClick={() => field.onChange('Dépense')} className={`w-full py-2 rounded-md transition-colors ${field.value === 'Dépense' ? 'bg-red-500 text-white font-semibold' : ''}`}>Dépense</button>
                <button type="button" onClick={() => field.onChange('Revenu')} className={`w-full py-2 rounded-md transition-colors ${field.value === 'Revenu' ? 'bg-green-500 text-white font-semibold' : ''}`}>Revenu</button>
              </div>
            )}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">Montant :</label>
          <div className="relative">
            <input type="number" id="amount"
              {...register('amount', {
                required: "Le montant est requis",
                valueAsNumber: true,
                min: { value: 0.01, message: "Le montant doit être positif" }
              })}
              className={`w-full p-2 pr-8 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.amount ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              placeholder="0.00" step="0.01"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">Date :</label>
          <input type="date" id="date"
            {...register('date', { required: "La date est requise" })}
            className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.date ? 'ring-red-500' : 'focus:ring-sky-500'}`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="mainCategoryId" className="block text-sm font-medium mb-1">Catégorie :</label>
          <select id="mainCategoryId"
            {...register('mainCategoryId', { required: "La catégorie est requise" })}
            className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.mainCategoryId ? 'ring-red-500' : 'focus:ring-sky-500'}`}
          >
            <option value="" disabled>Sélectionner une catégorie</option>
            {availableMainCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.mainCategoryId && <p className="text-red-500 text-xs mt-1">{errors.mainCategoryId.message}</p>}
        </div>

        {availableSubCategories.length > 0 && (
          <div>
            <label htmlFor="subCategoryId" className="block text-sm font-medium mb-1">Sous-Catégorie :</label>
            <select id="subCategoryId"
              {...register('subCategoryId')}
              className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">(Optionnel)</option>
              {availableSubCategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="note" className="block text-sm font-medium mb-1">Note (Optionnel) :</label>
          <textarea id="note"
            {...register('note')}
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={3} placeholder="Repas avec les collègues..."
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500">
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}