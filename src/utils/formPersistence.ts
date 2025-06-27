/**
 * Utility functions to handle form state persistence across tabs
 */

// Save form state to localStorage
export function saveFormState<T>(formKey: string, data: T): void {
  try {
    localStorage.setItem(`form_${formKey}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving form state:', error);
  }
}

// Load form state from localStorage
export function loadFormState<T>(formKey: string, defaultValue: T): T {
  try {
    const savedState = localStorage.getItem(`form_${formKey}`);
    return savedState ? JSON.parse(savedState) : defaultValue;
  } catch (error) {
    console.error('Error loading form state:', error);
    return defaultValue;
  }
}

// Clear form state from localStorage
export function clearFormState(formKey: string): void {
  try {
    localStorage.removeItem(`form_${formKey}`);
  } catch (error) {
    console.error('Error clearing form state:', error);
  }
}

// Auto-save wrapper for form inputs
export function useFormPersistence<T>(formKey: string, initialState: T): [T, (value: T) => void] {
  // This would typically use useEffect and useState in a React component
  // But for simplicity, we'll just provide the load and save functions
  return [
    loadFormState(formKey, initialState),
    (newValue: T) => saveFormState(formKey, newValue)
  ];
}
