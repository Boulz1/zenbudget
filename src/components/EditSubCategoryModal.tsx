// src/components/EditSubCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import type { SubCategory, MainCategory } from '../types';

export interface EditSubCategoryFormData {
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
  const [name, setName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');

  useEffect(() => {
    if (subCategory && isOpen) {
      setName(subCategory.name);
      setParentCategoryId(subCategory.parentCategoryId);
    }
    if (!subCategory && isOpen && mainCategories.length > 0) {
      // Default to first main category if creating a new subcategory from here (though not the primary path)
      setParentCategoryId(mainCategories[0].id);
    }
  }, [subCategory, isOpen, mainCategories]);

  if (!isOpen || !subCategory) { // This modal is specifically for editing existing subcategories
    return null;
  }

  const handleSaveClick = () => {
    if (!name || !parentCategoryId) {
      alert('Le nom et la catégorie parente sont obligatoires.');
      return;
    }
    onSave({ name, parentCategoryId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modifier la Sous-Catégorie</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="subCatNameEdit" className="block text-sm font-medium mb-1">Nom de la Sous-Catégorie :</label>
              <input
                type="text"
                id="subCatNameEdit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Loyer"
                required
              />
            </div>
            <div>
              <label htmlFor="parentCategoryEdit" className="block text-sm font-medium mb-1">Catégorie Principale Parente :</label>
              <select
                id="parentCategoryEdit"
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              >
                {mainCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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
