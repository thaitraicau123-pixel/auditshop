import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection, 
  serverTimestamp,
  increment,
  onSnapshot 
} from 'firebase/firestore';

/**
 * Lấy cấu hình Firebase từ localStorage hoặc Biến Môi Trường (Vite env)
 */
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('soatdon_firebase_config');
    if (saved) {
      const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
      if (parsed && (parsed.projectId || parsed.apiKey)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc cấu hình Firebase local:', e);
  }

  // Cấu hình chuẩn mặc định của dự án AuditShop (Google Firebase Firestore)
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCcGEKIY8a4DDiopW1y_YlQDEgDgUW0Q3o",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auditshop-4a398.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "auditshop-4a398",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "auditshop-4a398.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "476102388297",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:476102388297:web:d4d497d234c69623e0ad98",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5T1ZKM6W13",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || ""
  };
}

let firebaseAppInstance = null;
let firestoreInstance = null;

export function resetFirebaseApp() {
  firebaseAppInstance = null;
  firestoreInstance = null;
}

/**
 * Lưu cấu hình Firebase mới vào bộ nhớ
 */
export function saveFirebaseConfig(config) {
  if (!config) return false;
  try {
    localStorage.setItem('soatdon_firebase_config', JSON.stringify(config));
    // Reset instance cũ để khởi tạo lại
    resetFirebaseApp();
    return true;
  } catch (e) {
    console.error('Không thể lưu cấu hình Firebase:', e);
    return false;
  }
}

/**
 * Kiểm tra xem Firebase đã được thiết lập thông tin hợp lệ chưa
 */
export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config && config.projectId && config.apiKey && config.apiKey.length > 5);
}

export function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config || !config.projectId || !config.apiKey) {
    return null;
  }

  try {
    if (!firebaseAppInstance) {
      const apps = getApps();
      firebaseAppInstance = apps.length > 0 ? getApp() : initializeApp(config);
    }
    return firebaseAppInstance;
  } catch (e) {
    console.warn('Lỗi khởi tạo Firebase App:', e);
    return null;
  }
}

export function getFirebaseDb() {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    if (!firestoreInstance) {
      firestoreInstance = getFirestore(app);
    }
    return firestoreInstance;
  } catch (e) {
    console.warn('Lỗi kết nối Firestore:', e);
    return null;
  }
}

export {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  serverTimestamp,
  increment,
  onSnapshot
};
