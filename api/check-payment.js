// Vercel Serverless Function: Kiểm tra giao dịch thanh toán thực tế qua VietQR API & MB Bank
import fs from 'fs';
import path from 'path';

async function getVietQrBearerToken() {
  if (process.env.VIETQR_TOKEN) return process.env.VIETQR_TOKEN;

  if (global.__VIETQR_SYSTEM_TOKEN__ && Date.now() < global.__VIETQR_SYSTEM_TOKEN_EXPIRY__) {
    return global.__VIETQR_SYSTEM_TOKEN__;
  }

  const username = process.env.VIETQR_USERNAME || 'customer-soatdon-user26704';
  const password = process.env.VIETQR_PASSWORD || 'Y3VzdG9tZXItc29hdGRvbi11c2VyMjY3MDQ=';
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  const tokenEndpoints = [
    'https://api.vietqr.org/vqr/api/token_generate',
    'https://dev.vietqr.org/vqr/api/token_generate'
  ];

  for (const ep of tokenEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          global.__VIETQR_SYSTEM_TOKEN__ = data.access_token;
          global.__VIETQR_SYSTEM_TOKEN_EXPIRY__ = Date.now() + 270000;
          return data.access_token;
        }
      }
    } catch (e) {}
  }
  return null;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const query = req.query || {};
    const body = req.body || {};

    const code = String(query.code || body.code || '').trim().toUpperCase();
    const orderId = String(query.orderId || body.orderId || query.orderCode || body.orderCode || '').trim().toUpperCase();
    const amount = Number(query.amount || body.amount || 0);
    const bankAccount = "0986019623";

    let vietqrToken = String(
      query.vietqrToken || 
      body.vietqrToken || 
      process.env.VIETQR_TOKEN || 
      ''
    ).trim();

    if (!vietqrToken) {
      vietqrToken = await getVietQrBearerToken();
    }

    const sepayToken = String(
      query.token || 
      body.token || 
      process.env.SEPAY_API_TOKEN || 
      ''
    ).trim();

    // 1. Kiểm tra Mã Kích Hoạt Quản Trị / Master PIN (dành cho chủ shop hoặc test admin)
    const masterCodes = ['0986019623', '8888', '9999', 'SOATDON', 'VIP', 'VIP888'];
    if (code && masterCodes.includes(code)) {
      return res.status(200).json({
        success: true,
        verified: true,
        method: 'master_code',
        message: 'Xác thực thành công bằng Mã Quản Trị!'
      });
    }

    // 2. Kiểm tra bộ nhớ cache Webhook Callback từ VietQR
    const checkKey = orderId || code;
    if (global.__PAID_TRANSACTIONS__ && checkKey) {
      for (const [key, tx] of global.__PAID_TRANSACTIONS__.entries()) {
        const keyUpper = String(key).toUpperCase();
        if (keyUpper.includes(checkKey) || (orderId && keyUpper.includes(orderId))) {
          if (amount <= 0 || tx.amount >= (amount - 1000)) {
            return res.status(200).json({
              success: true,
              verified: true,
              method: 'vietqr_callback',
              transaction: tx,
              message: 'Tự động phát hiện thanh toán VietQR thành công qua Webhook!'
            });
          }
        }
      }
    }

    // Kiểm tra file cache local nếu có
    try {
      const cacheFile = path.join(process.cwd(), '.paid_cache.json');
      if (fs.existsSync(cacheFile)) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8') || '{}');
        for (const [k, tx] of Object.entries(cached)) {
          const kUpper = String(k).toUpperCase();
          if (checkKey && (kUpper.includes(checkKey) || (orderId && kUpper.includes(orderId)))) {
            if (amount <= 0 || tx.amount >= (amount - 1000)) {
              return res.status(200).json({
                success: true,
                verified: true,
                method: 'vietqr_cache',
                transaction: tx,
                message: 'Phát hiện giao dịch VietQR đã ghi nhận thành công!'
              });
            }
          }
        }
      }
    } catch (e) {
      // Ignored
    }

    // 3. Gọi trực tiếp API Tra Cứu Giao Dịch của VietQR (check-order)
    if (vietqrToken && (orderId || code)) {
      const endpoints = [
        'https://api.vietqr.org/vqr/api/transactions/check-order',
        'https://api.vietqr.org/vqr/api/ecommerce-transactions/check-order',
        'https://dev.vietqr.org/vqr/api/transactions/check-order'
      ];

      for (const endpoint of endpoints) {
        try {
          const vqrCheckRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${vietqrToken}`
            },
            body: JSON.stringify({
              bankAccount,
              type: 0, // 0: tra cứu theo orderId
              value: orderId || code
            })
          });

          if (vqrCheckRes.ok) {
            const vqrData = await vqrCheckRes.json();
            // Trạng thái: 1 = Đã thanh toán, hoặc status = 'PAID' / 'SUCCESS'
            const isPaid = vqrData.status === 1 || 
                           vqrData.status === '1' || 
                           vqrData.status === 'PAID' || 
                           vqrData.status === 'SUCCESS' ||
                           (vqrData.data && (vqrData.data.status === 1 || vqrData.data.status === 'PAID'));

            if (isPaid) {
              return res.status(200).json({
                success: true,
                verified: true,
                method: 'vietqr_api_direct',
                data: vqrData,
                message: 'VietQR API xác nhận đơn hàng đã thanh toán thành công!'
              });
            }
          }
        } catch (apiErr) {
          console.warn(`VietQR check-order failed on ${endpoint}:`, apiErr.message);
        }
      }
    }

    // 4. Nếu có SePay Token: Truy vấn sao kê tài khoản ngân hàng MB Bank
    if (sepayToken) {
      try {
        const sepayUrl = 'https://my.sepay.vn/userapi/transactions/list';
        const response = await fetch(sepayUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sepayToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const transactions = data.transactions || data.data || [];

          const matchedTx = transactions.find(tx => {
            const content = String(tx.transaction_content || tx.description || '').toUpperCase();
            const txAmount = parseFloat(tx.amount_in || tx.amount || 0);

            const matchCode = (code && content.includes(code)) || 
                              (orderId && content.includes(orderId));
            const matchAmount = amount <= 0 || txAmount >= (amount - 1000);

            return matchCode && matchAmount;
          });

          if (matchedTx) {
            return res.status(200).json({
              success: true,
              verified: true,
              method: 'sepay_auto',
              transaction: matchedTx,
              message: 'Tự động phát hiện chuyển khoản MB Bank thành công!'
            });
          }
        }
      } catch (sepayErr) {
        console.error('SePay lookup error:', sepayErr);
      }
    }

    // 5. NẾU CHƯA CÓ GIAO DỊCH: TRẢ VỀ VERIFIED: FALSE (KHÔNG MỞ KHÓA!)
    return res.status(200).json({
      success: false,
      verified: false,
      orderId: orderId || code,
      amount,
      message: 'Chưa phát hiện giao dịch khớp trên hệ thống MB Bank 0986019623. Vui lòng chuyển khoản đúng số tiền và nội dung, rồi thử lại sau giây lát!'
    });

  } catch (error) {
    console.error('Check payment error:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: error.message
    });
  }
}
