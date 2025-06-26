// src/components/EditMainCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import type { MainCategory, BudgetType } from '../types';

export interface EditMainCategoryFormData {
  name: string;
  budgetType: BudgetType;
}

interface EditMainCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditMainCategoryFormData) => void;
  category: MainCategory | null;
}

export function EditMainCategoryModal({ isOpen, onClose, onSave, category }: EditMainCategoryModalProps) {
  const [name, setName] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetType>('Besoins');

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setBudgetType(category.budgetType);
    }
  }, [category, isOpen]);

  if (!isOpen || !category) {
    return null;
  }

  const handleSaveClick = () => {
    if (!name) {
      alert('Le nom de la catégorie principale est obligatoire.');
      return;
    }
    onSave({ name, budgetType });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modifier la Catégorie Principale</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="mainCatNameEdit" className="block text-sm font-medium mb-1">Nom de la Catégorie Principale :</label>
              <input
                type="text"
                id="mainCatNameEdit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Logement"
                required
              />
            </div>
            <div>
              <label htmlFor="budgetTypeEdit" className="block text-sm font-medium mb-1">Associer au Budget :</label>
              <select
                id="budgetTypeEdit"
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as BudgetType)}
                className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Besoins">Besoins</option>
                <option value="Envies">Envies</option>
                <option value="Épargne">Épargne</option>
                <option value="Revenu">Revenu</option>
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
