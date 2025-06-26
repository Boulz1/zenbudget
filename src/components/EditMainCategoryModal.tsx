// src/components/EditMainCategoryModal.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { MainCategory, BudgetType } from '../types';

export interface EditMainCategoryFormData { // Renommé pour correspondre au nom du fichier (convention)
  name: string;
  budgetType: BudgetType;
}

interface EditMainCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditMainCategoryFormData) => void;
  category: MainCategory | null; // La catégorie à éditer
}

export function EditMainCategoryModal({ isOpen, onClose, onSave, category }: EditMainCategoryModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditMainCategoryFormData>();

  useEffect(() => {
    if (category && isOpen) {
      reset({
        name: category.name,
        budgetType: category.budgetType,
      });
    } else if (!isOpen) {
        reset({ name: '', budgetType: 'Besoins' }); // Reset on close as well
    }
  }, [category, isOpen, reset]);

  if (!isOpen || !category) { // Assurez-vous que la catégorie est fournie
    return null;
  }

  const onSubmit = (data: EditMainCategoryFormData) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modifier la Catégorie Principale</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="mainCatNameEdit" className="block text-sm font-medium mb-1">Nom de la Catégorie Principale :</label>
              <input
                type="text"
                id="mainCatNameEdit"
                {...register('name', { required: "Le nom est requis" })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                placeholder="Logement"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="budgetTypeEdit" className="block text-sm font-medium mb-1">Associer au Budget :</label>
              <select
                id="budgetTypeEdit"
                {...register('budgetType', { required: "Le type de budget est requis" })}
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

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
