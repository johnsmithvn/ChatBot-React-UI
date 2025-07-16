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
      // Determine the new value to store
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      console.log(`📝 localStorage setValue "${key}":`, { 
        old: storedValue, 
        new: valueToStore,
        valueIsFunction: value instanceof Function 
      });
      
      // Update state and localStorage
      setStoredValue(valueToStore);
      
      // Make sure we're storing a JSON-serializable value
      const jsonValue = JSON.stringify(valueToStore);
      window.localStorage.setItem(key, jsonValue);
      
      console.log(`✅ localStorage value saved for "${key}"`);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      console.error("Value that caused error:", value);
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
