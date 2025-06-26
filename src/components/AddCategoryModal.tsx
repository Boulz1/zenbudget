// src/components/AddCategoryModal.tsx

import React, { useState, useEffect } from 'react';
import type { MainCategory, SubCategory, BudgetType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type CategoryFormData = 
  | { type: 'main'; data: Omit<MainCategory, 'id'> }
  | { type: 'sub'; data: Omit<SubCategory, 'id'> };

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CategoryFormData) => void;
  mainCategories: MainCategory[];
}

export function AddCategoryModal({ isOpen, onClose, onSave, mainCategories }: AddCategoryModalProps) {
  const [categoryType, setCategoryType] = useState<'main' | 'sub'>('main');
  const [mainCatName, setMainCatName] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetType>('Besoins');
  const [subCatName, setSubCatName] = useState('');
  const [parentCatId, setParentCatId] = useState(mainCategories[0]?.id || '');

  useEffect(() => {
    if (isOpen) {
      setCategoryType('main');
      setMainCatName('');
      setBudgetType('Besoins');
      setSubCatName('');
      setParentCatId(mainCategories[0]?.id || '');
    }
  }, [isOpen, mainCategories]);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = () => {
    if (categoryType === 'main') {
      if (!mainCatName) {
        alert('Le nom de la catégorie principale est obligatoire.');
        return;
      }
      onSave({
        type: 'main',
        data: {
          name: mainCatName,
          budgetType: budgetType,
        }
      });
    } else {
      if (!subCatName || !parentCatId) {
        alert('Le nom et la catégorie parente sont obligatoires.');
        return;
      }
      onSave({
        type: 'sub',
        data: {
          name: subCatName,
          parentCategoryId: parentCatId,
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajouter une Catégorie</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type de Catégorie :</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="categoryType" value="main" checked={categoryType === 'main'} onChange={() => setCategoryType('main')} className="form-radio text-sky-500 focus:ring-sky-500" />
                Cat. Principale
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="categoryType" value="sub" checked={categoryType === 'sub'} onChange={() => setCategoryType('sub')} className="form-radio text-sky-500 focus:ring-sky-500" />
                Sous-Catégorie
              </label>
            </div>
          </div>

          {categoryType === 'main' && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div>
                <label htmlFor="mainCatName" className="block text-sm font-medium mb-1">Nom de la Catégorie Principale :</label>
                <input type="text" id="mainCatName" value={mainCatName} onChange={(e) => setMainCatName(e.target.value)} className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Logement" required />
              </div>
              <div>
                <label htmlFor="budgetType" className="block text-sm font-medium mb-1">Associer au Budget :</label>
                <select id="budgetType" value={budgetType} onChange={(e) => setBudgetType(e.target.value as BudgetType)} className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="Besoins">Besoins</option>
                  <option value="Envies">Envies</option>
                  <option value="Épargne">Épargne</option>
                  <option value="Revenu">Revenu</option>
                </select>
              </div>
            </div>
          )}

          {categoryType === 'sub' && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div>
                <label htmlFor="subCatName" className="block text-sm font-medium mb-1">Nom de la Sous-Catégorie :</label>
                <input type="text" id="subCatName" value={subCatName} onChange={(e) => setSubCatName(e.target.value)} className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Loyer" required />
              </div>
              <div>
                <label htmlFor="parentCategory" className="block text-sm font-medium mb-1">Catégorie Principale Parente :</label>
                <select id="parentCategory" value={parentCatId} onChange={(e) => setParentCatId(e.target.value)} className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500" required>
                  {mainCategories.length > 0 ? (
                    mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    <option disabled>Créez d'abord une catégorie principale</option>
                  )}
                </select>
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