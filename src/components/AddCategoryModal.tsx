// src/components/AddCategoryModal.tsx
import React, { useEffect, useRef } from 'react'; // Ajout de useRef
import { useForm, Controller } from 'react-hook-form';
import type { MainCategory, SubCategory, BudgetType } from '../types';

export type CategoryFormData = 
  | { type: 'main'; data: Omit<MainCategory, 'id'> }
  | { type: 'sub'; data: Omit<SubCategory, 'id'> };

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CategoryFormData) => void;
  mainCategories: MainCategory[];
  initialType?: 'main' | 'sub';
  initialParentCategoryId?: string;
}

type FormValues = {
  categoryType: 'main' | 'sub';
  mainCatName?: string;
  budgetType?: BudgetType;
  subCatName?: string;
  parentCatId?: string;
};

export function AddCategoryModal({
  isOpen,
  onClose,
  onSave,
  mainCategories,
  initialType = 'main',
  initialParentCategoryId
}: AddCategoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null); // Pour le focus initial
  const lastFocusedElementRef = useRef<HTMLElement | null>(null); // Pour restaurer le focus

  const modalTitleId = "addCategoryModalTitle";

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      categoryType: initialType,
      mainCatName: '',
      budgetType: 'Besoins',
      subCatName: '',
      parentCatId: initialType === 'sub' && initialParentCategoryId
                   ? initialParentCategoryId
                   : mainCategories[0]?.id || '',
    }
  });

  const watchedCategoryType = watch('categoryType');

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      reset({
        categoryType: initialType,
        mainCatName: '',
        budgetType: 'Besoins',
        subCatName: '',
        parentCatId: initialType === 'sub'
                       ? (initialParentCategoryId || mainCategories[0]?.id || '')
                       : (mainCategories[0]?.id || ''),
      });
      // Focus sur le bouton de fermeture lors de l'ouverture
      closeButtonRef.current?.focus();
    } else {
      // Restaurer le focus quand la modale se ferme
      lastFocusedElementRef.current?.focus();
    }
  }, [isOpen, initialType, initialParentCategoryId, mainCategories, reset]);

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
        ).filter(el => el.offsetParent !== null); // S'assurer qu'ils sont visibles

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    // Utiliser la capture pour l'événement keydown sur le document entier pour Echap
    // et sur la modale pour le Tab trapping.
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);


  // Ensure parentCatId is valid if type is 'sub'
  useEffect(() => {
    if (watchedCategoryType === 'sub') {
      const currentParentId = watch('parentCatId');
      const isValidParent = mainCategories.some(mc => mc.id === currentParentId);
      if (!currentParentId || !isValidParent) {
        setValue('parentCatId', mainCategories[0]?.id || '', { shouldValidate: true });
      }
    }
  }, [watchedCategoryType, mainCategories, setValue, watch]);


  if (!isOpen) {
    return null;
  }

  const onSubmit = (data: FormValues) => {
    if (data.categoryType === 'main') {
      onSave({
        type: 'main',
        data: {
          name: data.mainCatName!, // Already validated by required
          budgetType: data.budgetType!,
        }
      });
    } else { // type === 'sub'
      onSave({
        type: 'sub',
        data: {
          name: data.subCatName!, // Already validated by required
          parentCategoryId: data.parentCatId!,
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
         // Ne pas mettre role="dialog" ici, mais sur le panneau interne pour une meilleure structure.
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        // aria-describedby="optionalDescriptionId" // Si vous avez une description
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={modalTitleId} className="text-xl font-bold">Ajouter une Catégorie</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-2xl hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
            aria-label="Fermer la modale"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type de Catégorie :</label>
            <Controller
              name="categoryType"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...field} value="main" checked={field.value === 'main'} onChange={() => field.onChange('main')} className="form-radio text-sky-500 focus:ring-sky-500" />
                    Cat. Principale
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...field} value="sub" checked={field.value === 'sub'} onChange={() => field.onChange('sub')} className="form-radio text-sky-500 focus:ring-sky-500" />
                    Sous-Catégorie
                  </label>
                </div>
              )}
            />
          </div>

          {watchedCategoryType === 'main' && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div>
                <label htmlFor="mainCatName" className="block text-sm font-medium mb-1">Nom de la Catégorie Principale :</label>
                <input type="text" id="mainCatName"
                  {...register('mainCatName', { required: watchedCategoryType === 'main' ? "Le nom est requis" : false })}
                  className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.mainCatName ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                  placeholder="Logement"
                />
                {errors.mainCatName && <p className="text-red-500 text-xs mt-1">{errors.mainCatName.message}</p>}
              </div>
              <div>
                <label htmlFor="budgetType" className="block text-sm font-medium mb-1">Associer au Budget :</label>
                <select id="budgetType"
                  {...register('budgetType', { required: watchedCategoryType === 'main' ? "Le type de budget est requis" : false })}
                  className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.budgetType ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                >
                  <option value="Besoins">Besoins</option>
                  <option value="Envies">Envies</option>
                  <option value="Épargne">Épargne</option>
                  <option value="Revenu">Revenu</option>
                </select>
                 {errors.budgetType && <p className="text-red-500 text-xs mt-1">{errors.budgetType.message}</p>}
              </div>
            </div>
          )}

          {watchedCategoryType === 'sub' && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div>
                <label htmlFor="subCatName" className="block text-sm font-medium mb-1">Nom de la Sous-Catégorie :</label>
                <input type="text" id="subCatName"
                  {...register('subCatName', { required: watchedCategoryType === 'sub' ? "Le nom est requis" : false })}
                  className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.subCatName ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                  placeholder="Loyer"
                />
                {errors.subCatName && <p className="text-red-500 text-xs mt-1">{errors.subCatName.message}</p>}
              </div>
              <div>
                <label htmlFor="parentCatId" className="block text-sm font-medium mb-1">Catégorie Principale Parente :</label>
                <select id="parentCatId"
                  {...register('parentCatId', { required: watchedCategoryType === 'sub' ? "La catégorie parente est requise" : false })}
                  className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.parentCatId ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                  disabled={mainCategories.length === 0}
                >
                  {mainCategories.length > 0 ? (
                    mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Créez d'abord une catégorie principale</option>
                  )}
                </select>
                {errors.parentCatId && <p className="text-red-500 text-xs mt-1">{errors.parentCatId.message}</p>}
                 {mainCategories.length === 0 && watchedCategoryType === 'sub' && <p className="text-yellow-500 text-xs mt-1">Veuillez d'abord créer une catégorie principale.</p>}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}