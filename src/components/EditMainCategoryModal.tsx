// src/components/EditMainCategoryModal.tsx
import React, { useEffect, useRef } from 'react'; // Ajout de useRef
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
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const modalTitleId = "editMainCategoryModalTitle";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditMainCategoryFormData>();

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      if (category) {
        reset({
          name: category.name,
          budgetType: category.budgetType,
        });
      }
      closeButtonRef.current?.focus();
    } else if (!isOpen) {
      // Pas besoin de reset ici car les valeurs sont liées à `category`
      // qui ne change que si la modale est rouverte avec une autre catégorie.
      // Le reset initial de useForm ou celui dans le if (category && isOpen) gère ça.
      lastFocusedElementRef.current?.focus();
    }
  }, [category, isOpen, reset]);

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
        ).filter(el => el.offsetParent !== null);

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

  if (!isOpen || !category) {
    return null;
  }

  const onSubmit = (data: EditMainCategoryFormData) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={modalTitleId} className="text-xl font-bold">Modifier la Catégorie Principale</h2>
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
