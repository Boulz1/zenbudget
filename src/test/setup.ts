// src/test/setup.ts
import '@testing-library/jest-dom';
// Si vous avez d'autres configurations globales pour les tests, ajoutez-les ici.
// Par exemple, des mocks globaux, etc.

// Exemple de nettoyage après chaque test si nécessaire avec Vitest
import { afterEach } from 'vitest';

afterEach(() => {
  // Nettoyer les mocks ou d'autres états globaux si besoin
  // localStorage.clear(); // Par exemple, si vous voulez un localStorage propre pour chaque test de useLocalStorage
});
