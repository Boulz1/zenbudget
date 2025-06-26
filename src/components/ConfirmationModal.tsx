// src/components/ConfirmationModal.tsx
import React, { useEffect, useRef } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; // Permet du contenu riche comme des <p> ou <strong>
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirmer",
  cancelButtonText = "Annuler",
  confirmButtonVariant = 'primary',
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null); // Focus sur le bouton d'action principal
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const modalTitleId = "confirmationModalTitle";

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      confirmButtonRef.current?.focus();
    } else {
      lastFocusedElementRef.current?.focus();
    }
  }, [isOpen]);

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
        ).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));

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

  if (!isOpen) {
    return null;
  }

  const confirmButtonClasses = `px-4 py-2 rounded font-semibold transition-colors
    ${confirmButtonVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
      : 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500'
    } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800`;

  const cancelButtonClasses = `px-4 py-2 rounded font-semibold bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        aria-describedby={typeof message === 'string' ? 'confirmationModalMessage' : undefined}
      >
        <h2 id={modalTitleId} className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {title}
        </h2>
        {typeof message === 'string' ? (
          <p id="confirmationModalMessage" className="text-slate-600 dark:text-slate-300 mb-6">
            {message}
          </p>
        ) : (
          <div className="text-slate-600 dark:text-slate-300 mb-6">{message}</div>
        )}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className={cancelButtonClasses}>
            {cancelButtonText}
          </button>
          <button ref={confirmButtonRef} onClick={onConfirm} className={confirmButtonClasses}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
