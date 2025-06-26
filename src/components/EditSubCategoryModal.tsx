// src/components/EditSubCategoryModal.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubCategory, MainCategory } from '../types';

export interface EditSubCategoryFormData { // Renommé pour correspondre au nom du fichier
  name: string;
  parentCategoryId: string;
}

interface EditSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditSubCategoryFormData) => void;
  subCategory: SubCategory | null;
  mainCategories: MainCategory[];
}

export function EditSubCategoryModal({ isOpen, onClose, onSave, subCategory, mainCategories }: EditSubCategoryModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditSubCategoryFormData>();

  useEffect(() => {
    if (subCategory && isOpen) {
      reset({
        name: subCategory.name,
        parentCategoryId: subCategory.parentCategoryId,
      });
    } else if (!isOpen) {
        // Reset on close to ensure clean state for next open, though defaultValues in useForm also helps
        reset({ name: '', parentCategoryId: mainCategories[0]?.id || '' });
    }
  }, [subCategory, isOpen, reset, mainCategories]);

  if (!isOpen || !subCategory) {
    return null;
  }

  const onSubmit = (data: EditSubCategoryFormData) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modifier la Sous-Catégorie</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="subCatNameEdit" className="block text-sm font-medium mb-1">Nom de la Sous-Catégorie :</label>
              <input
                type="text"
                id="subCatNameEdit"
                {...register('name', { required: "Le nom est requis" })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                placeholder="Loyer"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="parentCategoryEdit" className="block text-sm font-medium mb-1">Catégorie Principale Parente :</label>
              <select
                id="parentCategoryEdit"
                {...register('parentCategoryId', { required: "La catégorie parente est requise" })}
                className={`w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border focus:outline-none focus:ring-2 ${errors.parentCategoryId ? 'border-red-500 ring-red-500' : 'border-transparent focus:ring-sky-500'}`}
                disabled={mainCategories.length === 0}
              >
                {mainCategories.length > 0 ? (
                    mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Créez d'abord une catégorie principale</option>
                  )
                }
              </select>
              {errors.parentCategoryId && <p className="text-red-500 text-xs mt-1">{errors.parentCategoryId.message}</p>}
              {mainCategories.length === 0 && <p className="text-yellow-500 text-xs mt-1">Veuillez d'abord créer une catégorie principale.</p>}
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
