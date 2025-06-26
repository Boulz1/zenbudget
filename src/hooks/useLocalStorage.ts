// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// Fonction pour obtenir la valeur initiale depuis le localStorage ou utiliser une valeur par défaut
function getStoredValue<T>(key: string, initialValue: T): T {
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    try {
      return JSON.parse(savedValue) as T;
    } catch (error) {
      console.error('Error parsing JSON from localStorage', error);
      return initialValue;
    }
  }
  return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // 1. On utilise useState, mais sa valeur initiale est lue depuis le localStorage
  const [value, setValue] = useState<T>(() => {
    return getStoredValue<T>(key, initialValue);
  });

  // 2. On utilise useEffect pour sauvegarder automatiquement dans le localStorage
  //    chaque fois que notre 'value' change.
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}