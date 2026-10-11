import { 
  getFirebaseDb, 
  isFirebaseConfigured,
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection, 
  serverTimestamp, 
  increment,
  onSnapshot
} from '../config/firebase';

export { isFirebaseConfigured };

/**
 * Đăng ký tài khoản trên Google Firebase Firestore
 */
export async function firebaseRegisterUser({ shopName, phone, password, plan = 'standard' }) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase chưa được cấu hình!');
  }

  const cleanPhone = String(phone || '').trim();
  const cleanShop = String(shopName || 'Shop Online').trim();

  // Kiểm tra tài khoản đã tồn tại chưa
  const userRef = doc(db, 'users', cleanPhone);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { success: false, message: 'Số điện thoại này đã được đăng ký trên Firebase!' };
  }

  const newUser = {
    id: 'USR_' + Math.floor(100000 + Math.random() * 900000),
    shopName: cleanShop,
    phone: cleanPhone,
    password: String(password || ''),
    balanceScans: 0,
    plan: plan || 'standard',
    createdAt: new Date().toISOString()
  };

  await setDoc(userRef, newUser);
  return { success: true, user: newUser, message: 'Đăng ký tài khoản thành công trên Google Firebase!' };
}

/**
 * Đăng nhập tài khoản trên Google Firebase Firestore
 */
export async function firebaseLoginUser(phone, password) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase chưa được cấu hình!');
  }

  const cleanPhone = String(phone || '').trim();
  const cleanPass = String(password || '').trim();

  // Kiểm tra tài khoản admin đặc quyền
  if (cleanPhone === '0986019623' && (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === '8888')) {
    const adminUser = {
      id: 'USR_ADMIN',
      shopName: 'Bùi Quốc Thái (Admin)',
      phone: '0986019623',
      password: 'admin',
      plan: 'monthly',
      balanceScans: 9999
    };
    try {
      await setDoc(doc(db, 'users', '0986019623'), adminUser, { merge: true });
    } catch (e) {}
    return { success: true, user: adminUser };
  }

  const userRef = doc(db, 'users', cleanPhone);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return { success: false, message: 'Số điện thoại không tồn tại trên hệ thống Firebase!' };
  }

  const userData = userSnap.data();
  if (userData.password !== cleanPass) {
    return { success: false, message: 'Mật khẩu không chính xác!' };
  }

  return { success: true, user: userData };
}

/**
 * Cập nhật số dư lượt quét hoặc gói cước VIP trên Firebase Firestore
 */
export async function firebaseUpdateUserBalance(phone, addScans, newPlan) {
  const db = getFirebaseDb();
  if (!db) return false;

  const cleanPhone = String(phone || '').trim();
  const userRef = doc(db, 'users', cleanPhone);

  const updatePayload = {
    updatedAt: new Date().toISOString()
  };

  if (typeof addScans === 'number') {
    updatePayload.balanceScans = increment(addScans);
  }
  if (newPlan) {
    updatePayload.plan = newPlan;
  }

  try {
    await updateDoc(userRef, updatePayload);
    return true;
  } catch (e) {
    console.error('Lỗi cập nhật Firebase Firestore:', e);
    return false;
  }
}

/**
 * Lấy danh sách toàn bộ tài khoản người dùng từ Firebase Firestore
 */
export async function firebaseFetchAllUsers() {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    const users = [];
    snapshot.forEach(docSnap => {
      users.push(docSnap.data());
    });
    return users;
  } catch (e) {
    console.error('Lỗi đọc danh sách tài khoản từ Firestore:', e);
    return [];
  }
}

/**
 * Lắng nghe cập nhật thời gian thực (Realtime sync) từ Firebase cho tài khoản đang đăng nhập
 */
export function firebaseListenToUser(phone, onUserUpdate) {
  const db = getFirebaseDb();
  if (!db || !phone) return () => {};

  try {
    const userRef = doc(db, 'users', String(phone).trim());
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUserUpdate(data);
      }
    }, (error) => {
      console.warn('Lỗi Firestore onSnapshot listener:', error);
    });

    return unsubscribe;
  } catch (e) {
    return () => {};
  }
}

/**
 * Thử kết nối tới Firebase Firestore để kiểm tra cấu hình hợp lệ
 */
export async function testFirebaseConnection() {
  const db = getFirebaseDb();
  if (!db) {
    return { success: false, message: 'Chưa cấu hình Firebase App hoặc thiếu API Key / Project ID' };
  }

  try {
    // Thử đọc collection test hoặc 'users'
    const colRef = collection(db, 'users');
    await getDocs(colRef);
    return { success: true, message: 'Kết nối thành công đến Google Firebase Firestore!' };
  } catch (err) {
    return { 
      success: false, 
      message: `Không thể kết nối Firebase: ${err.message || 'Kiểm tra lại Rules Firestore hoặc API Key'}` 
    };
  }
}
