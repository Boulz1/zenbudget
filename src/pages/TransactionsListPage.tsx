// src/pages/TransactionsListPage.tsx
import React, { useState } from 'react'; // Ajout de useState
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../components/Layout';
import { ConfirmationModal } from '../components/ConfirmationModal'; // Import
import type { Transaction } from '../types';

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
};

export function TransactionsListPage() {
  const { transactions, mainCategories, subCategories, onDeleteTransaction } = useAppContext();
  const navigate = useNavigate();
  // États pour la modale de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState<React.ReactNode>('');

  const mainCategoryMap = new Map(mainCategories.map(cat => [cat.id, cat.name]));
  const subCategoryMap = new Map(subCategories.map(sub => [sub.id, sub.name]));

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedTransactions = sortedTransactions.reduce((acc, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const getCategoryName = (tx: Transaction) => {
    const mainCatName = mainCategoryMap.get(tx.mainCategoryId) || 'Non catégorisé';
    if (tx.subCategoryId) {
      const subCatName = subCategoryMap.get(tx.subCategoryId);
      if (subCatName) return `${mainCatName} / ${subCatName}`;
    }
    return mainCatName;
  };

  const openConfirmationModal = (title: string, message: React.ReactNode, action: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleActualConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  const handleDeleteRequest = (transactionId: string) => {
    const txToDelete = transactions.find(tx => tx.id === transactionId);
    if (!txToDelete) return;

    const message = (
      <p>
        Êtes-vous sûr de vouloir supprimer la transaction de <strong>{txToDelete.amount.toFixed(2)}€</strong>
        ({getCategoryName(txToDelete)}) du {formatDate(txToDelete.date)} ?
      </p>
    );
    openConfirmationModal(
      "Confirmer la suppression",
      message,
      () => onDeleteTransaction(transactionId)
    );
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Liste des Transactions</h1>
      </header>

      {transactions.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <p className="text-gray-500">Aucune transaction pour le moment.</p>
          <p className="mt-2 text-sm">Cliquez sur le bouton (+) pour en ajouter une !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, txsOnDate]) => (
            <div key={date} className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <header className="bg-slate-100 dark:bg-slate-700/50 p-3">
                <h2 className="font-bold text-lg">{formatDate(date)}</h2>
              </header>
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {txsOnDate.map(tx => (
                  <li key={tx.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Dépense' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300'}`}>
                        {tx.type === 'Dépense' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-semibold">{getCategoryName(tx)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{tx.note || 'Aucune note'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.type === 'Dépense' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'Dépense' ? '-' : '+'} {tx.amount.toFixed(2)} €
                      </p>
                      <div className="text-sm space-x-3 mt-1"> {/* Augmentation de la taille et de l'espacement */}
                        <Link
                          to={`/transactions/${tx.id}/edit`}
                          className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline"
                          aria-label={`Modifier la transaction ${getCategoryName(tx)} de ${tx.amount.toFixed(2)}€ du ${formatDate(tx.date)}`}
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteRequest(tx.id)} // Modifié ici
                          className="font-medium text-red-600 dark:text-red-400 hover:underline"
                          aria-label={`Supprimer la transaction ${getCategoryName(tx)} de ${tx.amount.toFixed(2)}€ du ${formatDate(tx.date)}`}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm}
        onConfirm={handleActualConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText="Supprimer"
        confirmButtonVariant="danger"
      />
    </div>
  );
}