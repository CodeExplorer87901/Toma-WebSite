import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Конфигурация Firebase
// ВАЖНО: Замените эти значения на ваши реальные данные из Firebase Console
// Получить их можно здесь: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
export const db = getFirestore(app);

export default app;


