/**
 * Cloud Database Service cho SoatDon.vn
 * Đồng bộ tài khoản, lượt quét và quyền truy cập tức thì giữa tất cả các máy tính / thiết bị.
 */

const MASTER_BIN_ID = 'acbecad';
const DIRECT_CLOUD_URL = `https://extendsclass.com/api/json-storage/bin/${MASTER_BIN_ID}`;

// Helper gọi API đám mây (Ưu tiên /api/auth của Vercel, fallback sang Direct Cloud URL)
async function requestCloud(endpoint, options = {}) {
  // Thử qua Vercel Serverless Function trước
  try {
    const res = await fetch(`/api/auth${endpoint ? '?' + endpoint : ''}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Không kết nối được Vercel (chạy local vite hoặc offline)
  }

  // Fallback kết nối trực tiếp đến Cloud Bin
  try {
    const res = await fetch(DIRECT_CLOUD_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, accounts: data.accounts || [] };
    }
  } catch (e) {
    console.warn('Lỗi fallback kết nối Cloud DB:', e);
  }

  return null;
}

/**
 * Lấy tất cả tài khoản từ Cloud Database về máy
 */
export async function fetchCloudAccounts() {
  const result = await requestCloud('action=get_all');
  if (result && result.accounts && Array.isArray(result.accounts)) {
    // Cập nhật lại localStorage để làm cache nhanh
    localStorage.setItem('soatdon_accounts', JSON.stringify(result.accounts));
    return result.accounts;
  }
  // Nếu offline, đọc từ cache local
  try {
    return JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
  } catch {
    return [];
  }
}

/**
 * Đăng ký tài khoản mới và đồng bộ ngay lên Cloud Database
 */
export async function cloudRegister({ shopName, phone, password, plan = 'standard' }) {
  const cleanPhone = String(phone || '').trim();
  const cleanShop = String(shopName || 'Shop Online').trim();

  // 1. Thử gọi qua API
  try {
    const apiRes = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        shopName: cleanShop,
        phone: cleanPhone,
        password,
        plan
      })
    });
    const data = await apiRes.json();
    if (data.success && data.user) {
      // Lưu local cache
      const accounts = await fetchCloudAccounts();
      const updated = accounts.some(a => a.phone === cleanPhone) ? accounts : [...accounts, data.user];
      localStorage.setItem('soatdon_accounts', JSON.stringify(updated));
      localStorage.setItem('soatdon_user', JSON.stringify(data.user));
      return { success: true, user: data.user, message: data.message };
    } else if (data.message) {
      return { success: false, message: data.message };
    }
  } catch (e) {
    // Fallback: ghi trực tiếp lên Cloud Bin
  }

  // Fallback trực tiếp
  try {
    const getRes = await fetch(DIRECT_CLOUD_URL);
    const db = await getRes.json();
    db.accounts = db.accounts || [];

    if (db.accounts.some(a => a.phone === cleanPhone)) {
      return { success: false, message: 'Số điện thoại này đã được đăng ký trên hệ thống!' };
    }

    const newUser = {
      id: 'USR_' + Math.floor(100000 + Math.random() * 900000),
      shopName: cleanShop,
      phone: cleanPhone,
      password: String(password || ''),
      balanceScans: 0,
      plan: plan || 'standard',
      registeredAt: new Date().toISOString()
    };

    db.accounts.push(newUser);
    db.updatedAt = new Date().toISOString();

    await fetch(DIRECT_CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });

    localStorage.setItem('soatdon_accounts', JSON.stringify(db.accounts));
    localStorage.setItem('soatdon_user', JSON.stringify(newUser));

    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, message: 'Lỗi đồng bộ đám mây: ' + err.message };
  }
}

/**
 * Đăng nhập tài khoản từ bất kỳ máy nào (Máy khác lập tài khoản vẫn vào được)
 */
export async function cloudLogin(phone, password) {
  const cleanPhone = String(phone || '').trim();
  const cleanPass = String(password || '').trim();

  // 1. Thử gọi API đám mây
  try {
    const apiRes = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        phone: cleanPhone,
        password: cleanPass
      })
    });
    const data = await apiRes.json();
    if (data.success && data.user) {
      localStorage.setItem('soatdon_user', JSON.stringify(data.user));
      // Tải lại danh sách tài khoản mới nhất
      await fetchCloudAccounts();
      return { success: true, user: data.user };
    } else if (data.message) {
      return { success: false, message: data.message };
    }
  } catch (e) {
    // Fallback
  }

  // 2. Fallback trực tiếp đọc từ Cloud Bin
  try {
    const res = await fetch(DIRECT_CLOUD_URL, { headers: { 'Cache-Control': 'no-cache' } });
    if (res.ok) {
      const db = await res.json();
      const accounts = db.accounts || [];

      // Kiểm tra tài khoản admin
      if (cleanPhone === '0986019623' && (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === '8888')) {
        const adminUser = {
          id: 'USR_ADMIN',
          shopName: 'Bùi Quốc Thái (Admin)',
          phone: '0986019623',
          password: 'admin',
          plan: 'monthly',
          balanceScans: 9999
        };
        localStorage.setItem('soatdon_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }

      const user = accounts.find(a => a.phone === cleanPhone && a.password === cleanPass);
      if (user) {
        localStorage.setItem('soatdon_user', JSON.stringify(user));
        localStorage.setItem('soatdon_accounts', JSON.stringify(accounts));
        return { success: true, user };
      }
    }
  } catch (err) {}

  // 3. Fallback kiểm tra cache local nếu đang offline
  try {
    const localAccounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
    const localUser = localAccounts.find(a => a.phone === cleanPhone && a.password === cleanPass);
    if (localUser) {
      localStorage.setItem('soatdon_user', JSON.stringify(localUser));
      return { success: true, user: localUser };
    }
  } catch (e) {}

  return { success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác!' };
}

/**
 * Cập nhật lượt quét hoặc gói VIP và đồng bộ tức thì lên Cloud
 */
export async function cloudUpdateUserBalance(phone, addScans, newPlan) {
  const cleanPhone = String(phone || '').trim();

  // Cập nhật local trước để phản hồi tức thì
  try {
    const localUser = JSON.parse(localStorage.getItem('soatdon_user') || 'null');
    if (localUser && localUser.phone === cleanPhone) {
      if (typeof addScans === 'number') {
        localUser.balanceScans = Math.max(0, (localUser.balanceScans || 0) + addScans);
      }
      if (newPlan) {
        localUser.plan = newPlan;
      }
      localStorage.setItem('soatdon_user', JSON.stringify(localUser));
    }

    const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
    const idx = accounts.findIndex(a => a.phone === cleanPhone);
    if (idx !== -1) {
      if (typeof addScans === 'number') {
        accounts[idx].balanceScans = Math.max(0, (accounts[idx].balanceScans || 0) + addScans);
      }
      if (newPlan) {
        accounts[idx].plan = newPlan;
      }
      localStorage.setItem('soatdon_accounts', JSON.stringify(accounts));
    }
  } catch (e) {}

  // Đồng bộ lên Cloud DB
  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_balance',
        phone: cleanPhone,
        addScans,
        plan: newPlan
      })
    });
  } catch (e) {
    // Fallback direct
    try {
      const getRes = await fetch(DIRECT_CLOUD_URL);
      const db = await getRes.json();
      const u = (db.accounts || []).find(a => a.phone === cleanPhone);
      if (u) {
        if (typeof addScans === 'number') u.balanceScans = Math.max(0, (u.balanceScans || 0) + addScans);
        if (newPlan) u.plan = newPlan;
        db.updatedAt = new Date().toISOString();
        await fetch(DIRECT_CLOUD_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(db)
        });
      }
    } catch (err) {}
  }
}

/**
 * Tự động đồng bộ các tài khoản cũ trong localStorage lên Cloud nếu chưa có
 */
export async function syncLocalAccountsToCloud() {
  try {
    const localAccounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
    if (localAccounts.length > 0) {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_sync',
          accounts: localAccounts
        })
      });
    }
    // Lấy lại danh sách mới nhất từ Cloud
    await fetchCloudAccounts();
  } catch (e) {}
}
