// Vercel Serverless Function: Cloud Database Sync cho Hệ Thống Tài Khoản Đa Thiết Bị
const MASTER_BIN_ID = 'acbecad';
const CLOUD_DB_URL = `https://extendsclass.com/api/json-storage/bin/${MASTER_BIN_ID}`;

// Helper đọc dữ liệu từ Cloud DB
async function getCloudData() {
  try {
    const res = await fetch(CLOUD_DB_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.accounts)) {
        return data;
      }
    }
  } catch (e) {
    console.error('Lỗi đọc Cloud DB:', e);
  }
  return { accounts: [], transactions: [], updatedAt: new Date().toISOString() };
}

// Helper ghi dữ liệu vào Cloud DB
async function saveCloudData(data) {
  try {
    data.updatedAt = new Date().toISOString();
    const res = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.error('Lỗi ghi Cloud DB:', e);
    return false;
  }
}

export default async function handler(req, res) {
  // CORS Headers cho phép mọi máy tính / trình duyệt truy cập
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const body = req.body || {};
  const action = String(query.action || body.action || req.method === 'GET' ? 'get_all' : '').toLowerCase();

  try {
    const db = await getCloudData();

    // 1. LẤY DANH SÁCH TÀI KHOẢN (GET ALL / SYNC)
    if (req.method === 'GET' || action === 'get_all' || action === 'sync') {
      return res.status(200).json({
        success: true,
        accounts: db.accounts,
        updatedAt: db.updatedAt
      });
    }

    // 2. ĐĂNG KÝ TÀI KHOẢN MỚI TỪ MÁY NÀY (REGISTER)
    if (action === 'register') {
      const { shopName, phone, password, plan } = body;
      const cleanPhone = String(phone || '').trim();

      if (!cleanPhone || cleanPhone.length < 9) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ!' });
      }

      const existing = db.accounts.find(a => a.phone === cleanPhone);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký!' });
      }

      const newUser = {
        id: 'USR_' + Math.floor(100000 + Math.random() * 900000),
        shopName: String(shopName || 'Shop Online').trim(),
        phone: cleanPhone,
        password: String(password || ''),
        balanceScans: 0,
        plan: plan || 'standard',
        registeredAt: new Date().toISOString()
      };

      db.accounts.push(newUser);
      await saveCloudData(db);

      return res.status(200).json({
        success: true,
        user: newUser,
        message: 'Đăng ký tài khoản thành công và đã đồng bộ lên Cloud Database!'
      });
    }

    // 3. ĐĂNG NHẬP TỪ MÁY KHÁC (LOGIN)
    if (action === 'login') {
      const { phone, password } = body;
      const cleanPhone = String(phone || '').trim();
      const cleanPass = String(password || '').trim();

      // Kiểm tra tài khoản admin đặc quyền
      if (cleanPhone === '0986019623' && (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === '8888')) {
        let adminAcc = db.accounts.find(a => a.phone === '0986019623');
        if (!adminAcc) {
          adminAcc = {
            id: 'USR_ADMIN',
            shopName: 'Bùi Quốc Thái (Admin)',
            phone: '0986019623',
            password: 'admin',
            plan: 'monthly',
            balanceScans: 9999
          };
          db.accounts.push(adminAcc);
          await saveCloudData(db);
        }
        return res.status(200).json({
          success: true,
          user: adminAcc,
          message: 'Đăng nhập tài khoản Admin thành công!'
        });
      }

      const user = db.accounts.find(a => a.phone === cleanPhone && a.password === cleanPass);
      if (user) {
        return res.status(200).json({
          success: true,
          user,
          message: 'Đăng nhập thành công từ dữ liệu đám mây!'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Số điện thoại hoặc mật khẩu không chính xác!'
      });
    }

    // 4. CẬP NHẬT SỐ DƯ / GÓI DỊCH VỤ (UPDATE BALANCE / PLAN)
    if (action === 'update_balance' || action === 'update_plan') {
      const { phone, balanceScans, addScans, plan } = body;
      const cleanPhone = String(phone || '').trim();

      const userIdx = db.accounts.findIndex(a => a.phone === cleanPhone);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
      }

      if (typeof balanceScans === 'number') {
        db.accounts[userIdx].balanceScans = balanceScans;
      } else if (typeof addScans === 'number') {
        db.accounts[userIdx].balanceScans = (db.accounts[userIdx].balanceScans || 0) + addScans;
      }

      if (plan) {
        db.accounts[userIdx].plan = plan;
      }

      await saveCloudData(db);

      return res.status(200).json({
        success: true,
        user: db.accounts[userIdx],
        message: 'Cập nhật tài khoản thành công trên Cloud!'
      });
    }

    // 5. ĐỒNG BỘ BULK DỮ LIỆU TỪ MÁY HIỆN TẠI LÊN CLOUD
    if (action === 'bulk_sync') {
      const { accounts } = body;
      if (Array.isArray(accounts)) {
        const phoneMap = new Map(db.accounts.map(a => [a.phone, a]));
        accounts.forEach(acc => {
          if (acc && acc.phone && !phoneMap.has(acc.phone)) {
            db.accounts.push(acc);
          }
        });
        await saveCloudData(db);
      }
      return res.status(200).json({
        success: true,
        accounts: db.accounts
      });
    }

    return res.status(400).json({ success: false, message: 'Action không hợp lệ!' });
  } catch (err) {
    console.error('Serverless auth error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
