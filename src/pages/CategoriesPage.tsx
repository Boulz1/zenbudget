// src/pages/CategoriesPage.tsx
import { useState } from 'react';
import { AddCategoryModal, type CategoryFormData } from '../components/AddCategoryModal';
import { useAppContext } from '../components/Layout'; // Importer notre hook

// La page ne prend plus de props !
export function CategoriesPage() {
  // On récupère les données et fonctions nécessaires depuis le contexte
  const { mainCategories, subCategories, onAddCategory } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveCategory = (data: CategoryFormData) => {
    onAddCategory(data);
    handleCloseModal();
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <button 
          onClick={handleOpenModal}
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
                  <button className="text-sm text-yellow-500 hover:text-yellow-400">Modifier</button>
                  <button className="text-lg text-red-500 hover:text-red-400">X</button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sous-catégories :</h3>
                {relatedSubCategories.length > 0 ? (
                  <ul className="space-y-2">
                    {relatedSubCategories.map((subCat) => (
                      <li key={subCat.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                        <span>{subCat.name}</span>
                        <div className="flex items-center space-x-2 text-sm">
                          <button className="hover:text-yellow-400" title="Éditer">[e]</button>
                          <button className="hover:text-red-400" title="Supprimer">[d]</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune sous-catégorie.</p>
                )}
                 <button className="mt-4 text-sm text-sky-500 hover:text-sky-400 font-semibold">
                   (+) Ajouter Sous-Catégorie
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        mainCategories={mainCategories}
      />
    </div>
  );
}