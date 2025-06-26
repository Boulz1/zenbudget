// src/pages/EditTransactionPage.tsx
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
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

export function EditTransactionPage() {
  const { transactions, mainCategories, subCategories, onUpdateTransaction } = useAppContext();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();

  const transactionToEdit = useMemo(() =>
    transactions.find(tx => tx.id === transactionId),
    [transactions, transactionId]
  );

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useForm<FormValues>();

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        date: transactionToEdit.date.split('T')[0], // Assurer YYYY-MM-DD
        mainCategoryId: transactionToEdit.mainCategoryId,
        subCategoryId: transactionToEdit.subCategoryId || '',
        note: transactionToEdit.note || '',
      });
    }
  }, [transactionToEdit, reset]);

  const watchedType = watch('type');
  const watchedMainCategoryId = watch('mainCategoryId');

  const availableMainCategories = useMemo(() =>
    mainCategories.filter(cat => {
      if (watchedType === 'Dépense') {
        return cat.budgetType !== 'Revenu';
      }
      return cat.budgetType === 'Revenu';
    }),
    [mainCategories, watchedType]
  );

  const availableSubCategories = useMemo(() =>
    subCategories.filter(sub => sub.parentCategoryId === watchedMainCategoryId),
    [subCategories, watchedMainCategoryId]
  );

  useEffect(() => {
    if (isDirty) { // Seulement si l'utilisateur a interagi
      const currentMainCatIsValid = availableMainCategories.some(cat => cat.id === watchedMainCategoryId);
      if (!currentMainCatIsValid) {
        setValue('mainCategoryId', '', { shouldDirty: true });
      }
    }
  }, [watchedType, availableMainCategories, watchedMainCategoryId, setValue, isDirty]);

  useEffect(() => {
    if (isDirty) { // Seulement si l'utilisateur a interagi
        const currentSubCatIsValid = availableSubCategories.some(sub => sub.id === watch('subCategoryId'));
        if (!currentSubCatIsValid) {
          setValue('subCategoryId', '', { shouldDirty: true });
        }
    }
  }, [watchedMainCategoryId, availableSubCategories, setValue, watch, isDirty]);


  if (!transactionToEdit && !transactionId) { // Si transactionId est undefined, on ne sait pas quoi éditer
      return <Navigate to="/transactions" replace />;
  }
  // Si transactionId est défini mais transactionToEdit est undefined après le chargement initial,
  // cela signifie que la transaction n'a pas été trouvée.
  // On pourrait afficher un message "Chargement..." ou "Transaction non trouvée"
  if (transactionId && !transactionToEdit) {
     // Attendre que transactionToEdit soit chargé par le useEffect/reset ou rediriger si vraiment non trouvé
     // Pour l'instant, on peut ne rien rendre ou un loader, la redirection se fera si reset n'a rien à faire
     return <div>Chargement de la transaction...</div>; // Ou une meilleure UI de chargement/erreur
  }


  const onSubmit = (data: FormValues) => {
    if (!transactionId) return; // Sécurité, ne devrait pas arriver

    const updatedTransactionData: TransactionFormData = {
      ...data,
      amount: Number(data.amount),
      subCategoryId: data.subCategoryId || undefined,
      note: data.note || undefined,
    };

    onUpdateTransaction(transactionId, updatedTransactionData);
    navigate('/transactions');
  };

  return (
    <div>
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-2xl hover:text-sky-500">←</button>
        <h1 className="text-3xl font-bold">Modifier la Transaction</h1>
      </header>

      {transactionToEdit ? ( // Afficher le formulaire seulement si la transaction est chargée
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md space-y-4">
          <div>
            <span className="text-sm font-medium">Type:</span>
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
              Enregistrer les Modifications
            </button>
          </div>
        </form>
      ) : (
        // Si transactionToEdit n'est pas encore défini (après la vérification initiale de transactionId)
        // Cela peut être un état de chargement ou une transaction non trouvée après que le composant ait essayé de la charger.
        // Une redirection plus robuste pourrait être gérée dans le useEffect si transactionToEdit reste undefined.
        <div className="text-center p-8">Si la transaction n'apparaît pas, elle n'a pas été trouvée ou est en cours de chargement. <Link to="/transactions" className="text-sky-500 hover:underline">Retourner à la liste</Link>.</div>
      )}
    </div>
  );
}
