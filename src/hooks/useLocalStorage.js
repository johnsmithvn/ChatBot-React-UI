import { useState } from 'react';

/**
 * Custom hook để quản lý localStorage
 * @param {string} key - Key trong localStorage
 * @param {any} initialValue - Giá trị khởi tạo
 * @returns {[any, function, function]} [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  // Khởi tạo state từ localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Hàm để set giá trị mới
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Hàm để xóa giá trị
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}
