// Экспортируем типы и функции из firebaseStorage
export type { Product } from './firebaseStorage';

// Реэкспортируем функции из firebaseStorage для обратной совместимости
export {
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  setStoreStatus,
  getStoreStatus,
  clearStoreStatus,
  isStoreOpen,
  subscribeToProducts,
  subscribeToStoreStatus,
  initializeProducts
} from './firebaseStorage';

// Локальное хранилище для аутентификации (остается в localStorage)
const AUTH_KEY = 'outfit_store_auth';

export const login = (username: string, password: string): boolean => {
  if (username === 'admin' && password === '1234') {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};
