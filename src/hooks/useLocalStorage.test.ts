// src/hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      // console.log(`Mock setItem: key=${key}, value=${value}, typeof value=${typeof value}`);
      if (value === undefined) {
        // This case should ideally not happen if JSON.stringify is used correctly,
        // as JSON.stringify(undefined) results in undefined, which then shouldn't be passed.
        // However, if it's passed directly, it would be an issue.
        // The original localStorage.setItem would stringify it to "undefined".
        // For our test, we want to see if the hook passes an undefined literal.
        throw new Error("Mock setItem received undefined literal value, JSON.stringify would have handled this.");
      }
      store[key] = value; // Store the stringified value directly
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error for parsing errors
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initialValue if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return storedValue if localStorage has a value for the key', () => {
    localStorageMock.setItem('testKey', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorageMock.getItem('testKey')!)).toBe('updated');
  });

  it('should handle object values', () => {
    const initialValue = { name: 'Jules', age: 30 };
    const updatedValue = { name: 'Jules Verne', age: 31 };
    const { result } = renderHook(() => useLocalStorage('userKey', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);
    expect(JSON.parse(localStorageMock.getItem('userKey')!)).toEqual(updatedValue);
  });

  it('should handle initialValue being a function', () => {
    const { result } = renderHook(() => useLocalStorage('testKeyFunc', () => 'from function'));
    expect(result.current[0]).toBe('from function');
  });

  it('should return initialValue if JSON parsing fails for stored value', () => {
    localStorageMock.setItem('testKeyMalformed', 'this is not json');
    const { result } = renderHook(() => useLocalStorage('testKeyMalformed', 'initialFallback'));

    expect(result.current[0]).toBe('initialFallback');
    expect(console.error).toHaveBeenCalledWith('Error parsing JSON from localStorage', expect.any(SyntaxError));
  });

  it('should correctly store and retrieve a boolean value', () => {
    const { result: resultTrue } = renderHook(() => useLocalStorage('boolTestTrue', true));
    expect(resultTrue.current[0]).toBe(true);
    act(() => {
        resultTrue.current[1](false);
    });
    expect(resultTrue.current[0]).toBe(false);
    expect(JSON.parse(localStorageMock.getItem('boolTestTrue')!)).toBe(false);

    localStorageMock.clear();

    const { result: resultFalse } = renderHook(() => useLocalStorage('boolTestFalse', false));
    expect(resultFalse.current[0]).toBe(false);
     act(() => {
        resultFalse.current[1](true);
    });
    expect(resultFalse.current[0]).toBe(true);
    expect(JSON.parse(localStorageMock.getItem('boolTestFalse')!)).toBe(true);
  });

  it('should correctly store and retrieve a number value', () => {
    const { result } = renderHook(() => useLocalStorage('numberTest', 123));
    expect(result.current[0]).toBe(123);
    act(() => {
        result.current[1](456);
    });
    expect(result.current[0]).toBe(456);
    expect(JSON.parse(localStorageMock.getItem('numberTest')!)).toBe(456);
  });
});
