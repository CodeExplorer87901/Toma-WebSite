import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  size: string[];
  inStock: boolean;
  image: string;
}

const PRODUCTS_COLLECTION = 'products';
const STORE_STATUS_COLLECTION = 'storeStatus';

// Начальные товары для магазина (используются только при первом запуске)
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Классическая футболка',
    category: 'верх',
    price: 1500,
    size: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'
  },
  {
    id: '2',
    name: 'Джинсы Slim Fit',
    category: 'штаны',
    price: 3500,
    size: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop'
  },
  {
    id: '3',
    name: 'Кожаная куртка',
    category: 'куртки',
    price: 8500,
    size: ['M', 'L', 'XL'],
    inStock: false,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop'
  },
  {
    id: '4',
    name: 'Бейсболка Classic',
    category: 'кепки',
    price: 900,
    size: ['Универсальный'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=500&fit=crop'
  },
  {
    id: '5',
    name: 'Зимняя шапка',
    category: 'шапки',
    price: 1200,
    size: ['Универсальный'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=500&fit=crop'
  },
  {
    id: '6',
    name: 'Спортивная толстовка',
    category: 'верх',
    price: 2800,
    size: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop'
  },
  {
    id: '7',
    name: 'Карго штаны',
    category: 'штаны',
    price: 4200,
    size: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop'
  },
  {
    id: '8',
    name: 'Бомбер',
    category: 'куртки',
    price: 5500,
    size: ['S', 'M', 'L'],
    inStock: false,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop'
  },
  {
    id: '9',
    name: 'Снепбек Premium',
    category: 'кепки',
    price: 1500,
    size: ['Универсальный'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400&h=500&fit=crop'
  },
  {
    id: '10',
    name: 'Вязаная шапка',
    category: 'шапки',
    price: 1100,
    size: ['Универсальный'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1517677129300-07b130802f46?w=400&h=500&fit=crop'
  },
  {
    id: '11',
    name: 'Рубашка Оверсайз',
    category: 'верх',
    price: 2200,
    size: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop'
  },
  {
    id: '12',
    name: 'Пуховик зимний',
    category: 'куртки',
    price: 9500,
    size: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop'
  }
];

// Инициализация начальных товаров (вызывается один раз)
export const initializeProducts = async (): Promise<void> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    // Если коллекция пуста, добавляем начальные товары
    if (snapshot.empty) {
      for (const product of initialProducts) {
        await addDoc(productsRef, product);
      }
    }
  } catch (error) {
    console.error('Ошибка инициализации товаров:', error);
    throw error;
  }
};

// Получить все товары
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      // Если товаров нет, инициализируем начальные
      await initializeProducts();
      return initialProducts;
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    // Fallback на localStorage если Firebase не настроен
    return getLocalProducts();
  }
};

// Подписка на изменения товаров в реальном времени
export const subscribeToProducts = (
  callback: (products: Product[]) => void
): (() => void) => {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  
  return onSnapshot(
    productsRef,
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      callback(products);
    },
    (error) => {
      console.error('Ошибка подписки на товары:', error);
      // Fallback на localStorage
      callback(getLocalProducts());
    }
  );
};

// Добавить товар
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const newProduct = {
      ...product,
      id: Date.now().toString()
    };
    const docRef = await addDoc(productsRef, newProduct);
    return {
      ...newProduct,
      id: docRef.id
    };
  } catch (error) {
    console.error('Ошибка добавления товара:', error);
    throw error;
  }
};

// Удалить товар
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    throw error;
  }
};

// Обновить товар
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, updates);
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    throw error;
  }
};

// Сохранить статус магазина
export const setStoreStatus = async (isOpen: boolean): Promise<void> => {
  try {
    const statusRef = doc(db, STORE_STATUS_COLLECTION, 'current');
    await setDoc(statusRef, { isOpen, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Ошибка сохранения статуса магазина:', error);
    // Fallback на localStorage
    localStorage.setItem('outfit_store_status', isOpen ? 'open' : 'closed');
  }
};

// Получить статус магазина
export const getStoreStatus = async (): Promise<boolean | null> => {
  try {
    const statusRef = doc(db, STORE_STATUS_COLLECTION, 'current');
    const statusDoc = await (await import('firebase/firestore')).getDoc(statusRef);
    
    if (statusDoc.exists()) {
      return statusDoc.data().isOpen ?? null;
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения статуса магазина:', error);
    // Fallback на localStorage
    const status = localStorage.getItem('outfit_store_status');
    return status ? status === 'open' : null;
  }
};

// Подписка на изменения статуса магазина
export const subscribeToStoreStatus = (
  callback: (isOpen: boolean | null) => void
): (() => void) => {
  const statusRef = doc(db, STORE_STATUS_COLLECTION, 'current');
  
  return onSnapshot(
    statusRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().isOpen ?? null);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Ошибка подписки на статус магазина:', error);
      // Fallback на localStorage
      const status = localStorage.getItem('outfit_store_status');
      callback(status ? status === 'open' : null);
    }
  );
};

// Проверить открыт ли магазин
export const isStoreOpen = async (): Promise<boolean> => {
  try {
    const manualStatus = await getStoreStatus();
    if (manualStatus !== null) {
      return manualStatus;
    }
    
    // Автоматическая проверка по времени
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 20;
  } catch (error) {
    console.error('Ошибка проверки статуса магазина:', error);
    // Fallback на localStorage
    const status = localStorage.getItem('outfit_store_status');
    if (status !== null) {
      return status === 'open';
    }
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 20;
  }
};

// Очистить статус магазина (переключить на автоматический)
export const clearStoreStatus = async (): Promise<void> => {
  try {
    const statusRef = doc(db, STORE_STATUS_COLLECTION, 'current');
    await deleteDoc(statusRef);
  } catch (error) {
    console.error('Ошибка очистки статуса магазина:', error);
    localStorage.removeItem('outfit_store_status');
  }
};

// Fallback функции для работы с localStorage (если Firebase не настроен)
const getLocalProducts = (): Product[] => {
  const stored = localStorage.getItem('outfit_store_products');
  if (!stored) {
    localStorage.setItem('outfit_store_products', JSON.stringify(initialProducts));
    return initialProducts;
  }
  return JSON.parse(stored);
};

