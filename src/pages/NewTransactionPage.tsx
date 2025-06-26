// src/pages/NewTransactionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../components/Layout';
import type { Transaction } from '../types';

export function NewTransactionPage() {
  const { mainCategories, subCategories, onAddTransaction } = useAppContext();
  const navigate = useNavigate();

  // États du formulaire
  const [type, setType] = useState<'Dépense' | 'Revenu'>('Dépense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [note, setNote] = useState('');
  
  // Filtrer les sous-catégories disponibles en fonction de la catégorie principale choisie
  const availableSubCategories = subCategories.filter(
    sub => sub.parentCategoryId === mainCategoryId
  );
  
  // Réinitialiser la sous-catégorie si la catégorie principale change
  useEffect(() => {
    setSubCategoryId('');
  }, [mainCategoryId]);
  
  // Filtrer les catégories principales pour le dropdown (exclure les revenus pour les dépenses et inversement)
  const availableMainCategories = mainCategories.filter(cat => {
    if (type === 'Dépense') {
      return cat.budgetType !== 'Revenu';
    }
    return cat.budgetType === 'Revenu';
  });

  // Réinitialiser la catégorie principale si le type change
  useEffect(() => {
    setMainCategoryId('');
  }, [type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount || !mainCategoryId || parseFloat(amount) <= 0) {
      alert("Veuillez remplir le montant et la catégorie.");
      return;
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      type,
      amount: parseFloat(amount),
      date,
      mainCategoryId,
      subCategoryId: subCategoryId || undefined,
      note: note || undefined,
    };
    
    onAddTransaction(newTransaction);
    
    // Rediriger vers la liste des transactions après l'ajout
    navigate('/transactions');
  };

  return (
    <div>
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-2xl hover:text-sky-500">←</button>
        <h1 className="text-3xl font-bold">Nouvelle Transaction</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md space-y-4">
        
        <div>
          <span className="text-sm font-medium">Type:</span>
          <div className="mt-2 flex gap-4 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
            <button type="button" onClick={() => setType('Dépense')} className={`w-full py-2 rounded-md transition-colors ${type === 'Dépense' ? 'bg-red-500 text-white font-semibold' : ''}`}>Dépense</button>
            <button type="button" onClick={() => setType('Revenu')} className={`w-full py-2 rounded-md transition-colors ${type === 'Revenu' ? 'bg-green-500 text-white font-semibold' : ''}`}>Revenu</button>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">Montant :</label>
          <div className="relative">
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full p-2 pr-8 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="0.00" step="0.01" required
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">Date :</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" required
          />
        </div>

        <div>
          <label htmlFor="mainCategory" className="block text-sm font-medium mb-1">Catégorie :</label>
          <select id="mainCategory" value={mainCategoryId} onChange={e => setMainCategoryId(e.target.value)}
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" required
          >
            <option value="" disabled>Sélectionner une catégorie</option>
            {availableMainCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {availableSubCategories.length > 0 && (
          <div>
            <label htmlFor="subCategory" className="block text-sm font-medium mb-1">Sous-Catégorie :</label>
            <select id="subCategory" value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)}
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
          <textarea id="note" value={note} onChange={e => setNote(e.target.value)}
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