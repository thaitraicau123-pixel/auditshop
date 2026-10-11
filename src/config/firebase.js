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

  // Cấu hình fallback từ biến môi trường
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || ""
  };
}

/**
 * Lưu cấu hình Firebase mới vào bộ nhớ
 */
export function saveFirebaseConfig(config) {
  if (!config) return false;
  try {
    localStorage.setItem('soatdon_firebase_config', JSON.stringify(config));
    // Reset instance cũ để khởi tạo lại
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

/**
 * Khởi tạo Firebase App an toàn
 */
let firebaseAppInstance = null;
let firestoreInstance = null;

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
