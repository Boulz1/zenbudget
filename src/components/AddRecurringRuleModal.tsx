// src/components/AddRecurringRuleModal.tsx
import React, { useEffect, useMemo, useRef } from 'react'; // Ajout de useRef
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from './Layout'; // Ajuster le chemin si nécessaire
import type { MainCategory, SubCategory, RecurringTransactionRule, Frequency, TransactionFormData } from '../types'; // Assurer que TransactionFormData est importé si on s'en inspire

// Type pour les données du formulaire, excluant les champs auto-générés
export type RecurringRuleFormData = Omit<RecurringTransactionRule, 'id' | 'lastGeneratedDate' | 'nextDueDate' | 'isActive'>;

interface AddRecurringRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecurringRuleFormData) => void;
}

export function AddRecurringRuleModal({ isOpen, onClose, onSave }: AddRecurringRuleModalProps) {
  const { mainCategories, subCategories } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const modalTitleId = "addRecurringRuleModalTitle";

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<RecurringRuleFormData>({
    defaultValues: {
      name: '',
      type: 'Dépense',
      amount: undefined,
      mainCategoryId: '',
      subCategoryId: '',
      note: '',
      frequency: 'monthly',
      interval: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      dayOfWeek: undefined, // 0 for Sunday
      dayOfMonth: 1,
    }
  });

  const watchedType = watch('type');
  const watchedMainCategoryId = watch('mainCategoryId');
  const watchedFrequency = watch('frequency');

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      reset({
        name: '',
        type: 'Dépense',
        amount: undefined,
        mainCategoryId: mainCategories[0]?.id || '', // Pré-sélectionner si possible
        subCategoryId: '',
        note: '',
        frequency: 'monthly',
        interval: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        dayOfWeek: 0, // Maintenir les valeurs par défaut du reset
        dayOfMonth: 1,
      });
      closeButtonRef.current?.focus();
    } else {
      lastFocusedElementRef.current?.focus();
    }
  }, [isOpen, reset, mainCategories]); // mainCategories ajouté car utilisé dans le reset

  // Gestion de la touche Echap et du piégeage du focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        const focusableElements = Array.from(
          modalElement.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled')); // Exclure les éléments désactivés

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

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

  useEffect(() => {
    if (!availableMainCategories.find(cat => cat.id === watchedMainCategoryId)) {
      setValue('mainCategoryId', mainCategories[0]?.id || '');
    }
  }, [availableMainCategories, watchedMainCategoryId, setValue, mainCategories]);

  useEffect(() => {
    if (!availableSubCategories.find(sub => sub.id === watch('subCategoryId'))) {
      setValue('subCategoryId', '');
    }
  }, [availableSubCategories, watchedMainCategoryId, setValue, watch]);

  // Logique pour afficher/cacher et valider conditionnellement dayOfWeek/dayOfMonth
  useEffect(() => {
    if (watchedFrequency !== 'weekly') {
      setValue('dayOfWeek', undefined);
    }
    if (watchedFrequency !== 'monthly' && watchedFrequency !== 'yearly') {
      setValue('dayOfMonth', undefined);
    }
  }, [watchedFrequency, setValue]);


  const onSubmit = (data: RecurringRuleFormData) => {
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
    onSave(dataToSave);
    onClose(); // Fermer la modale après sauvegarde
  };

  if (!isOpen) {
    return null;
  }

  const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id={modalTitleId} className="text-xl font-bold">Ajouter une Règle Récurrente</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-2xl hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
            aria-label="Fermer la modale"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom de la règle */}
          <div>
            <label htmlFor="ruleName" className="block text-sm font-medium mb-1">Nom de la règle :</label>
            <input type="text" id="ruleName"
              {...register('name', { required: "Le nom de la règle est requis" })}
              className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.name ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              placeholder="Ex: Loyer, Salaire Netflix"
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
            <label htmlFor="ruleAmount" className="block text-sm font-medium mb-1">Montant :</label>
            <div className="relative">
              <input type="number" id="ruleAmount"
                {...register('amount', { required: "Le montant est requis", valueAsNumber: true, min: { value: 0.01, message: "Le montant doit être positif" } })}
                className={`w-full p-2 pr-8 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.amount ? 'ring-red-500' : 'focus:ring-sky-500'}`}
                placeholder="0.00" step="0.01"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {/* Catégories */}
          <div>
            <label htmlFor="ruleMainCategoryId" className="block text-sm font-medium mb-1">Catégorie :</label>
            <select id="ruleMainCategoryId"
              {...register('mainCategoryId', { required: "La catégorie est requise" })}
              className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.mainCategoryId ? 'ring-red-500' : 'focus:ring-sky-500'}`}
            >
              <option value="" disabled>Sélectionner une catégorie</option>
              {availableMainCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            {errors.mainCategoryId && <p className="text-red-500 text-xs mt-1">{errors.mainCategoryId.message}</p>}
          </div>
          {availableSubCategories.length > 0 && (
            <div>
              <label htmlFor="ruleSubCategoryId" className="block text-sm font-medium mb-1">Sous-Catégorie :</label>
              <select id="ruleSubCategoryId" {...register('subCategoryId')}
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
              <label htmlFor="ruleFrequency" className="block text-sm font-medium mb-1">Fréquence :</label>
              <select id="ruleFrequency" {...register('frequency', { required: "Fréquence requise"})}
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
              <label htmlFor="ruleInterval" className="block text-sm font-medium mb-1">Intervalle :</label>
              <input type="number" id="ruleInterval"
                {...register('interval', { required: "Intervalle requis", valueAsNumber: true, min: { value: 1, message: "Minimum 1" }})}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.interval ? 'ring-red-500' : 'focus:ring-sky-500'}`}
                placeholder="1"
              />
              {errors.interval && <p className="text-red-500 text-xs mt-1">{errors.interval.message}</p>}
            </div>
          </div>

          {/* Champs spécifiques à la fréquence */}
          {watchedFrequency === 'weekly' && (
            <div>
              <label htmlFor="ruleDayOfWeek" className="block text-sm font-medium mb-1">Jour de la semaine :</label>
              <select id="ruleDayOfWeek"
                {...register('dayOfWeek', { required: "Jour requis", valueAsNumber: true })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.dayOfWeek ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              >
                {daysOfWeek.map((day, index) => <option key={index} value={index}>{day}</option>)}
              </select>
              {errors.dayOfWeek && <p className="text-red-500 text-xs mt-1">{errors.dayOfWeek.message}</p>}
            </div>
          )}
          {(watchedFrequency === 'monthly' || watchedFrequency === 'yearly') && (
            <div>
              <label htmlFor="ruleDayOfMonth" className="block text-sm font-medium mb-1">Jour du mois :</label>
              <select id="ruleDayOfMonth"
                {...register('dayOfMonth', { required: "Jour requis", valueAsNumber: true, min: 1, max: 31 })}
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
              <label htmlFor="ruleStartDate" className="block text-sm font-medium mb-1">Date de début :</label>
              <input type="date" id="ruleStartDate"
                {...register('startDate', { required: "Date de début requise"})}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 ${errors.startDate ? 'ring-red-500' : 'focus:ring-sky-500'}`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label htmlFor="ruleEndDate" className="block text-sm font-medium mb-1">Date de fin (optionnel) :</label>
              <input type="date" id="ruleEndDate"
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
            <label htmlFor="ruleNote" className="block text-sm font-medium mb-1">Note (Optionnel) :</label>
            <textarea id="ruleNote" {...register('note')}
              className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2} placeholder="Détails supplémentaires..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600">Enregistrer la Règle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
