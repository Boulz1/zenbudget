// src/pages/RecurringTransactionsPage.tsx
import React, { useState } from 'react';
import { useAppContext } from '../components/Layout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AddRecurringRuleModal, type RecurringRuleFormData } from '../components/AddRecurringRuleModal';
import { EditRecurringRuleModal } from '../components/EditRecurringRuleModal';
import { ConfirmationModal } from '../components/ConfirmationModal'; // Import
import type { RecurringTransactionRule } from '../types';

export function RecurringTransactionsPage() {
  const {
    recurringTransactionRules,
    onDeleteRecurringRule,
    onUpdateRecurringRule,
    onAddRecurringRule
  } = useAppContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRuleToEdit, setCurrentRuleToEdit] = useState<RecurringTransactionRule | null>(null);

  // États pour la modale de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState<React.ReactNode>('');

  const handleSaveNewRule = (data: RecurringRuleFormData) => {
    onAddRecurringRule(data);
    // La modale Add se ferme via son propre `onClose` qui est appelé dans son `onSubmit`
  };

  const handleOpenEditModal = (rule: RecurringTransactionRule) => {
    setCurrentRuleToEdit(rule);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedRule = (id: string, data: RecurringRuleFormData) => {
    onUpdateRecurringRule(id, data);
    // La modale Edit se ferme via son propre `onClose`
  };

  const handleToggleActive = (ruleId: string, currentIsActive: boolean) => {
    // Le nom et autres détails ne changent pas, donc on peut les extraire de la règle existante si besoin pour le toast
    const ruleToUpdate = recurringTransactionRules.find(r => r.id === ruleId);
    if (ruleToUpdate) {
        onUpdateRecurringRule(ruleId, { isActive: !currentIsActive });
    }
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

  const handleDeleteRequest = (ruleId: string) => {
    const ruleToDelete = recurringTransactionRules.find(r => r.id === ruleId);
    if (!ruleToDelete) return;

    const message = (
      <p>Êtes-vous sûr de vouloir supprimer la règle récurrente <strong>"{ruleToDelete.name}"</strong> ?</p>
    );
    openConfirmationModal(
      "Confirmer la suppression",
      message,
      () => onDeleteRecurringRule(ruleId)
    );
  };

  const getFrequencyText = (frequency: string, interval: number) => {
    if (interval === 1) {
      switch (frequency) {
        case 'daily': return 'Quotidien';
        case 'weekly': return 'Hebdomadaire';
        case 'monthly': return 'Mensuel';
        case 'yearly': return 'Annuel';
        default: return frequency;
      }
    }
    switch (frequency) {
      case 'daily': return `Tous les ${interval} jours`;
      case 'weekly': return `Toutes les ${interval} semaines`;
      case 'monthly': return `Tous les ${interval} mois`;
      case 'yearly': return `Tous les ${interval} ans`;
      default: return `${frequency} (intervalle ${interval})`;
    }
  };


  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions Récurrentes</h1>
        <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
        >
          (+) Ajouter une Règle
        </button>
      </header>

      <AddRecurringRuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewRule}
      />

      {currentRuleToEdit && (
        <EditRecurringRuleModal
            isOpen={isEditModalOpen}
            onClose={() => {
                setIsEditModalOpen(false);
                setCurrentRuleToEdit(null);
            }}
            onSave={handleSaveEditedRule}
            ruleToEdit={currentRuleToEdit}
        />
      )}

      {recurringTransactionRules.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">Aucune règle de transaction récurrente définie.</p>
          <p className="mt-2 text-sm">Cliquez sur "Ajouter une Règle" pour commencer.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl"> {/* overflow-hidden retiré */}
          <div className="overflow-x-auto"> {/* Nouveau div wrapper pour le défilement */}
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Nom</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fréquence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Proch. Échéance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recurringTransactionRules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{rule.name}</div>
                    <div className={`text-xs ${rule.type === 'Dépense' ? 'text-red-500' : 'text-green-500'}`}>{rule.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {rule.amount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {getFrequencyText(rule.frequency, rule.interval)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {format(new Date(rule.nextDueDate), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {rule.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleToggleActive(rule.id, rule.isActive)} className={`text-xs p-1 rounded hover:underline ${rule.isActive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {rule.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => handleOpenEditModal(rule)} className="text-yellow-600 dark:text-yellow-400 hover:underline">Modifier</button>
                    <button onClick={() => handleDeleteRequest(rule.id)} className="text-red-600 dark:text-red-400 hover:underline">Supprimer</button> {/* Modifié ici */}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
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
