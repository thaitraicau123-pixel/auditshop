// Vercel Serverless Function: Tạo mã VietQR động theo chuẩn VietQR API (api.vietqr.org)

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

    const amount = Number(query.amount || body.amount || 9000);
    const orderId = String(query.orderId || body.orderId || `SD${Math.floor(100000 + Math.random() * 900000)}`).slice(0, 13);
    const content = String(query.content || body.content || orderId).slice(0, 23);
    const bankAccount = "0986019623";
    const bankCode = "MB";
    const userBankName = "BUI QUOC THAI";

    let token = String(
      query.token || 
      body.token || 
      process.env.VIETQR_TOKEN || 
      ''
    ).trim();

    if (!token) {
      token = await getVietQrBearerToken();
    }

    // Chuẩn bị fallback URL (Quicklink VietQR chuẩn Napas 24/7)
    const fallbackQrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(userBankName)}`;

    // Nếu có token VietQR API, gọi endpoint tạo mã động chính thức của VietQR
    if (token) {
      const endpoints = [
        'https://api.vietqr.org/vqr/api/qr/generate-customer',
        'https://dev.vietqr.org/vqr/api/qr/generate-customer'
      ];

      for (const endpoint of endpoints) {
        try {
          const vqrRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              bankCode,
              bankAccount,
              userBankName,
              content,
              qrType: 0, // VietQR động
              amount,
              orderId,
              transType: 'C'
            })
          });

          if (vqrRes.ok) {
            const vqrData = await vqrRes.json();
            return res.status(200).json({
              success: true,
              source: 'vietqr_api',
              qrUrl: vqrData.qrLink || fallbackQrUrl,
              qrCode: vqrData.qrCode || '',
              vaAccount: vqrData.vaAccount || null,
              orderId,
              amount,
              content,
              bankAccount,
              userBankName,
              data: vqrData
            });
          }
        } catch (callErr) {
          console.warn(`VietQR API call failed on ${endpoint}:`, callErr.message);
        }
      }
    }

    // Nếu không có token hoặc token chưa được duyệt UAT, trả về VietQR Quicklink Napas
    return res.status(200).json({
      success: true,
      source: 'vietqr_quicklink',
      qrUrl: fallbackQrUrl,
      orderId,
      amount,
      content,
      bankAccount,
      bankCode,
      userBankName,
      message: 'Mã VietQR Napas MB Bank đã sẵn sàng để quét!'
    });

  } catch (error) {
    console.error('VietQR Generate Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
