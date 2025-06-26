// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// Fonction pour obtenir la valeur initiale depuis le localStorage ou utiliser une valeur par défaut
function getStoredValue<T>(key: string, resolvedInitialValue: T): T { // Attend la valeur déjà résolue
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    try {
      return JSON.parse(savedValue) as T;
    } catch (error) {
      console.error('Error parsing JSON from localStorage', error);
      return resolvedInitialValue; // Utiliser la valeur résolue en cas d'erreur
    }
  }
  // Si rien dans localStorage, retourne la valeur initiale résolue
  return resolvedInitialValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T) // Accepte une valeur ou une fonction pour l'initialisation paresseuse
): [T, React.Dispatch<React.SetStateAction<T>>] {

  const [value, setValue] = useState<T>(() => {
    // Déterminer la valeur initiale à passer à getStoredValue
    // Si initialValue est une fonction, l'exécuter pour obtenir la valeur réelle.
    // Sinon, utiliser initialValue directement.
    const actualInitialValue = initialValue instanceof Function ? initialValue() : initialValue;
    return getStoredValue<T>(key, actualInitialValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}