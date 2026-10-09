// Vercel Serverless Function: Tiếp nhận Webhook Callback từ VietQR khi có biến động số dư MB Bank
import fs from 'fs';
import path from 'path';

// Bộ nhớ cache tạm các giao dịch đã thanh toán
if (!global.__PAID_TRANSACTIONS__) {
  global.__PAID_TRANSACTIONS__ = new Map();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ONLINE',
      service: 'VietQR Callback Webhook Endpoint',
      bank: 'MB Bank 0986019623'
    });
  }

  try {
    const payload = req.body || {};
    console.log('Received VietQR Callback Webhook:', JSON.stringify(payload));

    // Trích xuất thông tin giao dịch từ VietQR callback
    // Cấu trúc callback VietQR thường chứa orderId, amount, content, referenceNumber, vaAccount...
    const orderId = String(payload.orderId || payload.order_id || payload.orderCode || '').toUpperCase().trim();
    const amount = Number(payload.amount || payload.transferAmount || 0);
    const content = String(payload.content || payload.transaction_content || payload.description || '').toUpperCase().trim();
    const ref = String(payload.transactionRefId || payload.referenceNumber || payload.id || Date.now());

    const txRecord = {
      orderId,
      amount,
      content,
      ref,
      bankAccount: '0986019623',
      receivedAt: new Date().toISOString()
    };

    // Lưu vào bộ nhớ cache toàn cục
    if (orderId) {
      global.__PAID_TRANSACTIONS__.set(orderId, txRecord);
    }
    if (content) {
      global.__PAID_TRANSACTIONS__.set(content, txRecord);
    }
    // Cũng lưu theo ref
    global.__PAID_TRANSACTIONS__.set(ref, txRecord);

    // Lưu file local dự phòng nếu có thể ghi
    try {
      const cacheFile = path.join(process.cwd(), '.paid_cache.json');
      let currentCache = {};
      if (fs.existsSync(cacheFile)) {
        currentCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8') || '{}');
      }
      currentCache[orderId || ref] = txRecord;
      fs.writeFileSync(cacheFile, JSON.stringify(currentCache, null, 2));
    } catch (e) {
      // Ignored in read-only serverless environment
    }

    // Trả về response theo chuẩn VietQR yêu cầu
    return res.status(200).json({
      code: '00',
      status: 'SUCCESS',
      message: 'Transaction received and recorded successfully',
      data: { orderId, amount, ref }
    });

  } catch (error) {
    console.error('VietQR Callback Error:', error);
    return res.status(500).json({
      code: '99',
      status: 'FAILED',
      message: error.message
    });
  }
}
