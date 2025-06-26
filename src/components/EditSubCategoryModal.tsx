// src/components/EditSubCategoryModal.tsx
import React, { useEffect, useRef } from 'react'; // Ajout de useRef
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
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const modalTitleId = "editSubCategoryModalTitle";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditSubCategoryFormData>();

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      if (subCategory) {
        reset({
          name: subCategory.name,
          parentCategoryId: subCategory.parentCategoryId,
        });
      }
      closeButtonRef.current?.focus();
    } else if (!isOpen) {
      // Le reset on close ici peut être discutable si on veut garder les valeurs si l'utilisateur
      // rouvre rapidement la même modale. Cependant, pour la cohérence avec AddCategoryModal
      // et pour éviter des états inattendus si la `subCategory` prop change pendant que c'est fermé,
      // un reset peut être plus sûr ou simplement laisser le `reset` dans le if(isOpen) faire son travail.
      // Pour l'instant, on se fie au reset dans le bloc isOpen et à la restauration du focus.
      lastFocusedElementRef.current?.focus();
    }
  }, [subCategory, isOpen, reset]);

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


  if (!isOpen || !subCategory) {
    return null;
  }

  const onSubmit = (data: EditSubCategoryFormData) => {
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
          <h2 id={modalTitleId} className="text-xl font-bold">Modifier la Sous-Catégorie</h2>
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
