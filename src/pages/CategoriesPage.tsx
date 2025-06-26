// src/pages/CategoriesPage.tsx
import React, { useState } from 'react'; // Ajout de React pour React.ReactNode
import { AddCategoryModal, type CategoryFormData } from '../components/AddCategoryModal';
import { EditMainCategoryModal, type EditMainCategoryFormData } from '../components/EditMainCategoryModal';
import { EditSubCategoryModal, type EditSubCategoryFormData } from '../components/EditSubCategoryModal';
import { ConfirmationModal } from '../components/ConfirmationModal'; // Import de la nouvelle modale
import { useAppContext } from '../components/Layout'; // Importer notre hook
import type { MainCategory, SubCategory } from '../types';

export function CategoriesPage() {
  const {
    mainCategories,
    subCategories,
    onAddCategory,
    onUpdateMainCategory,
    onDeleteMainCategory,
    onUpdateSubCategory,
    onDeleteSubCategory
  } = useAppContext();
  
  // State for AddCategoryModal: null when closed, or object with config when open
  const [addModalConfig, setAddModalConfig] =
    useState<{ isOpen: boolean; type?: 'main' | 'sub'; parentId?: string } | null>(null);

  const [isEditMainCatModalOpen, setIsEditMainCatModalOpen] = useState(false);
  const [currentEditingMainCat, setCurrentEditingMainCat] = useState<MainCategory | null>(null);

  const [isEditSubCatModalOpen, setIsEditSubCatModalOpen] = useState(false);
  const [currentEditingSubCat, setCurrentEditingSubCat] = useState<SubCategory | null>(null);

  // États pour la modale de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState<React.ReactNode>('');


  // Opens the modal for adding a general category (defaults to main)
  const handleOpenGenericAddModal = () => {
    setAddModalConfig({ isOpen: true, type: 'main' });
  };

  // Opens the modal specifically to add a sub-category to a given main category
  const handleOpenAddSubModal = (mainCategoryId: string) => {
    setAddModalConfig({ isOpen: true, type: 'sub', parentId: mainCategoryId });
  };

  const handleCloseAddModal = () => {
    setAddModalConfig(null);
  };

  const handleOpenEditMainCatModal = (category: MainCategory) => {
    setCurrentEditingMainCat(category);
    setIsEditMainCatModalOpen(true);
  };
  const handleCloseEditMainCatModal = () => {
    setCurrentEditingMainCat(null);
    setIsEditMainCatModalOpen(false);
  };

  const handleOpenEditSubCatModal = (subCategory: SubCategory) => {
    setCurrentEditingSubCat(subCategory);
    setIsEditSubCatModalOpen(true);
  };
  const handleCloseEditSubCatModal = () => {
    setCurrentEditingSubCat(null);
    setIsEditSubCatModalOpen(false);
  };

  const handleSaveAddCategory = (data: CategoryFormData) => {
    onAddCategory(data);
    handleCloseAddModal();
  };

  const handleSaveEditMainCategory = (data: EditMainCategoryFormData) => {
    if (currentEditingMainCat) {
      onUpdateMainCategory(currentEditingMainCat.id, data);
    }
    handleCloseEditMainCatModal();
  };

  const handleSaveEditSubCategory = (data: EditSubCategoryFormData) => {
    if (currentEditingSubCat) {
      onUpdateSubCategory(currentEditingSubCat.id, data);
    }
    handleCloseEditSubCatModal();
  };

  const openConfirmationModal = (title: string, message: React.ReactNode, action: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action); // Stocker l'action
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
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


  const handleDeleteMainCategoryRequest = (id: string) => {
    const categoryToDelete = mainCategories.find(cat => cat.id === id);
    if (!categoryToDelete) return;

    const message = (
      <>
        <p>Êtes-vous sûr de vouloir supprimer la catégorie principale <strong>"{categoryToDelete.name}"</strong> ?</p>
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
          Attention : Toutes les sous-catégories associées seront également supprimées et les transactions liées perdront leur catégorisation.
        </p>
      </>
    );
    openConfirmationModal(
      "Confirmer la suppression",
      message,
      () => onDeleteMainCategory(id)
    );
  };

  const handleDeleteSubCategoryRequest = (id: string) => {
    const subCategoryToDelete = subCategories.find(sub => sub.id === id);
    if (!subCategoryToDelete) return;

    const message = (
      <>
        <p>Êtes-vous sûr de vouloir supprimer la sous-catégorie <strong>"{subCategoryToDelete.name}"</strong> ?</p>
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
          Attention : Les transactions liées perdront leur assignation à cette sous-catégorie.
        </p>
      </>
    );
    openConfirmationModal(
      "Confirmer la suppression",
      message,
      () => onDeleteSubCategory(id)
    );
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <button 
          onClick={handleOpenGenericAddModal} // Changed from handleOpenAddModal
          className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
        >
          Ajouter une Catégorie (+)
        </button>
      </header>

      <div className="space-y-6">
        {mainCategories.map((mainCat) => {
          const relatedSubCategories = subCategories.filter(
            (sub) => sub.parentCategoryId === mainCat.id
          );

          return (
            <div key={mainCat.id} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                <h2 className="text-xl font-bold">
                  {mainCat.name}{' '}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({mainCat.budgetType})
                  </span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditMainCatModal(mainCat)}
                    className="font-medium text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                    aria-label={`Modifier la catégorie principale ${mainCat.name}`}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteMainCategoryRequest(mainCat.id)} // Modifié ici
                    className="font-medium text-sm text-red-600 dark:text-red-400 hover:underline"
                    aria-label={`Supprimer la catégorie principale ${mainCat.name}`}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sous-catégories :</h3>
                {relatedSubCategories.length > 0 ? (
                  <ul className="space-y-2">
                    {relatedSubCategories.map((subCat) => (
                      <li key={subCat.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                        <span>{subCat.name}</span>
                        <div className="flex items-center space-x-3 text-sm"> {/* Ajustement de l'espacement */}
                          <button
                            onClick={() => handleOpenEditSubCatModal(subCat)}
                            className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline"
                            aria-label={`Modifier la sous-catégorie ${subCat.name}`}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategoryRequest(subCat.id)} // Modifié ici
                            className="font-medium text-red-600 dark:text-red-400 hover:underline"
                            aria-label={`Supprimer la sous-catégorie ${subCat.name}`}
                          >
                            Supprimer
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune sous-catégorie.</p>
                )}
                 <button
                    onClick={() => handleOpenAddSubModal(mainCat.id)} // Changed to use specific handler
                    className="mt-4 text-sm text-sky-500 hover:text-sky-400 font-semibold"
                  >
                   (+) Ajouter Sous-Catégorie
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal (Main or Sub) */}
      {addModalConfig?.isOpen && (
        <AddCategoryModal
          isOpen={addModalConfig.isOpen}
          onClose={handleCloseAddModal}
          onSave={handleSaveAddCategory}
          mainCategories={mainCategories}
          initialType={addModalConfig.type}
          initialParentCategoryId={addModalConfig.parentId}
        />
      )}
      {/* Edit Main Category Modal */}
      {currentEditingMainCat && (
        <EditMainCategoryModal
          isOpen={isEditMainCatModalOpen}
          onClose={handleCloseEditMainCatModal}
          onSave={handleSaveEditMainCategory}
          category={currentEditingMainCat}
        />
      )}
      {/* Edit Sub Category Modal */}
      {currentEditingSubCat && (
        <EditSubCategoryModal
          isOpen={isEditSubCatModalOpen}
          onClose={handleCloseEditSubCatModal}
          onSave={handleSaveEditSubCategory}
          subCategory={currentEditingSubCat}
          mainCategories={mainCategories}
        />
      )}

      {/* Modale de Confirmation */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText="Supprimer"
        confirmButtonVariant="danger"
      />
    </div>
  );
}