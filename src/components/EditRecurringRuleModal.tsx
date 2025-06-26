// src/components/EditRecurringRuleModal.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from './Layout';
import type { MainCategory, SubCategory, RecurringTransactionRule, Frequency, TransactionFormData } from '../types';
import type { RecurringRuleFormData } from './AddRecurringRuleModal'; // Réutiliser ce type

interface EditRecurringRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: RecurringRuleFormData) => void;
  ruleToEdit: RecurringTransactionRule | null;
}

export function EditRecurringRuleModal({ isOpen, onClose, onSave, ruleToEdit }: EditRecurringRuleModalProps) {
  const { mainCategories, subCategories } = useAppContext();

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<RecurringRuleFormData>();

  useEffect(() => {
    if (isOpen && ruleToEdit) {
      reset({
        name: ruleToEdit.name,
        type: ruleToEdit.type,
        amount: ruleToEdit.amount,
        mainCategoryId: ruleToEdit.mainCategoryId,
        subCategoryId: ruleToEdit.subCategoryId || '',
        note: ruleToEdit.note || '',
        frequency: ruleToEdit.frequency,
        interval: ruleToEdit.interval,
        startDate: ruleToEdit.startDate.split('T')[0], // Assurer format YYYY-MM-DD
        endDate: ruleToEdit.endDate?.split('T')[0] || '',
        dayOfWeek: ruleToEdit.dayOfWeek !== undefined ? ruleToEdit.dayOfWeek : (ruleToEdit.frequency === 'weekly' ? 0 : undefined),
        dayOfMonth: ruleToEdit.dayOfMonth !== undefined ? ruleToEdit.dayOfMonth : ( (ruleToEdit.frequency === 'monthly' || ruleToEdit.frequency === 'yearly') ? 1 : undefined),
      });
    } else if (!isOpen) {
        // Optionnel: reset à un état vide ou aux dernières valeurs pour éviter flash de contenu non pertinent si ruleToEdit change pendant que fermé
        reset({ name: '', type: 'Dépense', amount: undefined, mainCategoryId: '', subCategoryId:'', note:'', frequency: 'monthly', interval: 1, startDate: '', endDate: '', dayOfWeek: undefined, dayOfMonth: undefined});
    }
  }, [isOpen, ruleToEdit, reset]);

  const watchedType = watch('type');
  const watchedMainCategoryId = watch('mainCategoryId');
  const watchedFrequency = watch('frequency');

  const availableMainCategories = useMemo(() =>
    mainCategories.filter(cat => {
      if (watchedType === 'Dépense') return cat.budgetType !== 'Revenu';
      return cat.budgetType === 'Revenu';
    }),
    [mainCategories, watchedType]
  );

  const availableSubCategories = useMemo(() =>
    subCategories.filter(sub => sub.parentCategoryId === watchedMainCategoryId),
    [subCategories, watchedMainCategoryId]
  );

  // S'assurer que les catégories sont valides après le chargement/changement de type
   useEffect(() => {
    const currentMainCat = watch('mainCategoryId');
    if (isOpen && ruleToEdit && !availableMainCategories.find(cat => cat.id === currentMainCat) && availableMainCategories.length > 0) {
      setValue('mainCategoryId', availableMainCategories[0].id);
    }
  }, [isOpen, ruleToEdit, availableMainCategories, watch, setValue]);

  useEffect(() => {
    const currentSubCat = watch('subCategoryId');
    if (isOpen && ruleToEdit && !availableSubCategories.find(sub => sub.id === currentSubCat) && watchedMainCategoryId) {
       // No need to auto-select a sub-category, empty is fine
    }
  }, [isOpen, ruleToEdit, availableSubCategories, watchedMainCategoryId, watch, setValue]);


  // Logique pour afficher/cacher et valider conditionnellement dayOfWeek/dayOfMonth
  useEffect(() => {
    if (watchedFrequency !== 'weekly') {
      setValue('dayOfWeek', undefined);
    } else if (watch('dayOfWeek') === undefined && ruleToEdit?.frequency === 'weekly') {
        // if switching to weekly and it was weekly before, keep old value or default
        setValue('dayOfWeek', ruleToEdit?.dayOfWeek !== undefined ? ruleToEdit.dayOfWeek : 0);
    } else if (watch('dayOfWeek') === undefined) {
        setValue('dayOfWeek', 0); // Default to Sunday if becoming weekly
    }


    if (watchedFrequency !== 'monthly' && watchedFrequency !== 'yearly') {
      setValue('dayOfMonth', undefined);
    } else if (watch('dayOfMonth') === undefined && (ruleToEdit?.frequency === 'monthly' || ruleToEdit?.frequency === 'yearly')) {
        setValue('dayOfMonth', ruleToEdit?.dayOfMonth !== undefined ? ruleToEdit.dayOfMonth : 1);
    } else if (watch('dayOfMonth') === undefined) {
        setValue('dayOfMonth', 1); // Default to 1st if becoming monthly/yearly
    }
  }, [watchedFrequency, setValue, ruleToEdit, watch]);


  const onSubmit = (data: RecurringRuleFormData) => {
    if (!ruleToEdit) return; // Ne devrait pas arriver si la modale est ouverte correctement

    const dataToSave: RecurringRuleFormData = {
        ...data,
        amount: Number(data.amount),
        interval: Number(data.interval),
        dayOfWeek: data.frequency === 'weekly' ? Number(data.dayOfWeek) : undefined,
        dayOfMonth: (data.frequency === 'monthly' || data.frequency === 'yearly') ? Number(data.dayOfMonth) : undefined,
        subCategoryId: data.subCategoryId || undefined,
        endDate: data.endDate || undefined,
        note: data.note || undefined,
    };
    onSave(ruleToEdit.id, dataToSave);
    onClose();
  };

  if (!isOpen || !ruleToEdit) { // Vérifier ruleToEdit aussi
    return null;
  }

  const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Modifier la Règle Récurrente</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom de la règle */}
          <div>
            <label htmlFor="editRuleName" className="block text-sm font-medium mb-1">Nom de la règle :</label>
            <input type="text" id="editRuleName"
              {...register('name', { required: "Le nom de la règle est requis" })}
              className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.name ? 'ring-red-500' : 'focus:ring-sky-500'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Type (Dépense/Revenu) */}
          <div>
            <span className="text-sm font-medium">Type :</span>
            <Controller name="type" control={control} render={({ field }) => (
              <div className="mt-2 flex gap-4 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <button type="button" onClick={() => field.onChange('Dépense')} className={`w-full py-2 rounded-md transition-colors ${field.value === 'Dépense' ? 'bg-red-500 text-white font-semibold' : ''}`}>Dépense</button>
                <button type="button" onClick={() => field.onChange('Revenu')} className={`w-full py-2 rounded-md transition-colors ${field.value === 'Revenu' ? 'bg-green-500 text-white font-semibold' : ''}`}>Revenu</button>
              </div>
            )}/>
          </div>

          {/* Montant */}
          <div>
            <label htmlFor="editRuleAmount" className="block text-sm font-medium mb-1">Montant :</label>
            <div className="relative">
              <input type="number" id="editRuleAmount"
                {...register('amount', { required: "Le montant est requis", valueAsNumber: true, min: { value: 0.01, message: "Le montant doit être positif" } })}
                className={`w-full p-2 pr-8 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.amount ? 'ring-red-500' : 'focus:ring-sky-500'}`}
                step="0.01"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {/* Catégories */}
          <div>
            <label htmlFor="editRuleMainCategoryId" className="block text-sm font-medium mb-1">Catégorie :</label>
            <select id="editRuleMainCategoryId"
              {...register('mainCategoryId', { required: "La catégorie est requise" })}
              className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.mainCategoryId ? 'ring-red-500' : 'focus:ring-sky-500'}`}
            >
              <option value="" disabled>Sélectionner une catégorie</option>
              {availableMainCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            {errors.mainCategoryId && <p className="text-red-500 text-xs mt-1">{errors.mainCategoryId.message}</p>}
          </div>
          {availableSubCategories.length > 0 && ( // Afficher seulement si des sous-catégories sont pertinentes
            <div>
              <label htmlFor="editRuleSubCategoryId" className="block text-sm font-medium mb-1">Sous-Catégorie :</label>
              <select id="editRuleSubCategoryId" {...register('subCategoryId')}
                className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">(Optionnel)</option>
                {availableSubCategories.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
              </select>
            </div>
          )}

          {/* Fréquence et Intervalle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editRuleFrequency" className="block text-sm font-medium mb-1">Fréquence :</label>
              <select id="editRuleFrequency" {...register('frequency', { required: "Fréquence requise"})}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.frequency ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
              </select>
              {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>}
            </div>
            <div>
              <label htmlFor="editRuleInterval" className="block text-sm font-medium mb-1">Intervalle :</label>
              <input type="number" id="editRuleInterval"
                {...register('interval', { required: "Intervalle requis", valueAsNumber: true, min: { value: 1, message: "Minimum 1" }})}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.interval ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              />
              {errors.interval && <p className="text-red-500 text-xs mt-1">{errors.interval.message}</p>}
            </div>
          </div>

          {/* Champs spécifiques à la fréquence */}
          {watchedFrequency === 'weekly' && (
            <div>
              <label htmlFor="editRuleDayOfWeek" className="block text-sm font-medium mb-1">Jour de la semaine :</label>
              <select id="editRuleDayOfWeek"
                {...register('dayOfWeek', {
                    required: watchedFrequency === 'weekly' ? "Jour requis" : false,
                    valueAsNumber: true
                })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.dayOfWeek ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              >
                {daysOfWeek.map((day, index) => <option key={index} value={index}>{day}</option>)}
              </select>
              {errors.dayOfWeek && <p className="text-red-500 text-xs mt-1">{errors.dayOfWeek.message}</p>}
            </div>
          )}
          {(watchedFrequency === 'monthly' || watchedFrequency === 'yearly') && (
            <div>
              <label htmlFor="editRuleDayOfMonth" className="block text-sm font-medium mb-1">Jour du mois :</label>
              <select id="editRuleDayOfMonth"
                {...register('dayOfMonth', {
                    required: (watchedFrequency === 'monthly' || watchedFrequency === 'yearly') ? "Jour requis" : false,
                    valueAsNumber: true, min: 1, max: 31
                })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.dayOfMonth ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              >
                {daysInMonth.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              {errors.dayOfMonth && <p className="text-red-500 text-xs mt-1">{errors.dayOfMonth.message}</p>}
            </div>
          )}

          {/* Dates de début et de fin */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editRuleStartDate" className="block text-sm font-medium mb-1">Date de début :</label>
              <input type="date" id="editRuleStartDate"
                {...register('startDate', { required: "Date de début requise"})}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.startDate ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label htmlFor="editRuleEndDate" className="block text-sm font-medium mb-1">Date de fin (optionnel) :</label>
              <input type="date" id="editRuleEndDate"
                {...register('endDate', {
                    validate: (value, formValues) => {
                        if (value && formValues.startDate && value < formValues.startDate) {
                            return "La date de fin ne peut pas être antérieure à la date de début";
                        }
                        return true;
                    }
                })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.endDate ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="editRuleNote" className="block text-sm font-medium mb-1">Note (Optionnel) :</label>
            <textarea id="editRuleNote" {...register('note')}
              className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2} placeholder="Détails supplémentaires..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600">Enregistrer les Modifications</button>
          </div>
        </form>
      </div>
    </div>
  );
}
