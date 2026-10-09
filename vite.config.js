import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Bộ nhớ cache giao dịch đã thanh toán
if (!global.__PAID_TRANSACTIONS__) {
  global.__PAID_TRANSACTIONS__ = new Map();
}

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'api-vietqr-middlewares',
      configureServer(server) {
        // Handler Get Token dùng chung
        const handleGetToken = (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }
          const authHeader = req.headers.authorization || '';
          let username = '';
          if (authHeader.startsWith('Basic ')) {
            const decoded = Buffer.from(authHeader.substring(6).trim(), 'base64').toString('utf8');
            username = decoded.split(':')[0] || '';
          }
          const accessToken = `vqr_token_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
          res.end(JSON.stringify({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 300,
            scope: 'read write',
            username: username || 'soatdon_admin',
            message: 'Get Token thành công'
          }));
        };

        server.middlewares.use('/vqr/api/token_generate', handleGetToken);
        server.middlewares.use('/api/token_generate', handleGetToken);

        // Handler Transaction Callback dùng chung
        const handleTransactionCallback = (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') {
            res.end(JSON.stringify({ status: 'ONLINE', service: 'VietQR Callback Local Middleware' }));
            return;
          }

          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(bodyStr || '{}');
              const orderId = String(payload.orderId || payload.order_id || payload.orderCode || '').toUpperCase().trim();
              const amount = Number(payload.amount || payload.transferAmount || 0);
              const content = String(payload.content || payload.transaction_content || '').toUpperCase().trim();

              const tx = { orderId, amount, content, receivedAt: new Date().toISOString() };
              if (orderId) global.__PAID_TRANSACTIONS__.set(orderId, tx);
              if (content) global.__PAID_TRANSACTIONS__.set(content, tx);

              res.end(JSON.stringify({ code: '00', status: 'SUCCESS', message: 'Callback received' }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        };

        server.middlewares.use('/vqr/bank/aod/test/transaction-callback', handleTransactionCallback);
        server.middlewares.use('/vqr/bank/aod/transaction-callback', handleTransactionCallback);
        server.middlewares.use('/vqr/bank/aod/prod/transaction-callback', handleTransactionCallback);
        server.middlewares.use('/bank/aod/test/transaction-callback', handleTransactionCallback);
        server.middlewares.use('/bank/aod/transaction-callback', handleTransactionCallback);
        server.middlewares.use('/api/vietqr-callback', handleTransactionCallback);


        // Helper tự động lấy Bearer Token từ VietQR bằng Username/Password hệ thống
        const getSystemToken = async () => {
          if (process.env.VIETQR_TOKEN) return process.env.VIETQR_TOKEN;
          if (global.__VIETQR_SYSTEM_TOKEN__ && Date.now() < global.__VIETQR_SYSTEM_TOKEN_EXPIRY__) {
            return global.__VIETQR_SYSTEM_TOKEN__;
          }
          const user = process.env.VIETQR_USERNAME || 'customer-soatdon-user26704';
          const pass = process.env.VIETQR_PASSWORD || 'Y3VzdG9tZXItc29hdGRvbi11c2VyMjY3MDQ=';
          const basic = Buffer.from(`${user}:${pass}`).toString('base64');
          for (const ep of ['https://api.vietqr.org/vqr/api/token_generate', 'https://dev.vietqr.org/vqr/api/token_generate']) {
            try {
              const res = await fetch(ep, {
                method: 'POST',
                headers: { 'Authorization': `Basic ${basic}`, 'Content-Type': 'application/json' }
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
        };

        // 2. Endpoint Tạo Mã VietQR Động
        server.middlewares.use('/api/vietqr-generate', async (req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const amount = Number(url.searchParams.get('amount') || 9000);
          const orderId = String(url.searchParams.get('orderId') || `SD${Math.floor(100000 + Math.random() * 900000)}`).slice(0, 13);
          const content = String(url.searchParams.get('content') || orderId).slice(0, 23);
          const bankAccount = "0986019623";
          const bankCode = "MB";
          const userBankName = "NGUYEN VAN THAI";
          let token = url.searchParams.get('token') || process.env.VIETQR_TOKEN || '';
          if (!token) token = await getSystemToken();


          res.setHeader('Content-Type', 'application/json');

          const fallbackQrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(userBankName)}`;

          if (token) {
            try {
              const vqrRes = await fetch('https://api.vietqr.org/vqr/api/qr/generate-customer', {
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
                  qrType: 0,
                  amount,
                  orderId,
                  transType: 'C'
                })
              });
              if (vqrRes.ok) {
                const vqrData = await vqrRes.json();
                res.end(JSON.stringify({
                  success: true,
                  source: 'vietqr_api',
                  qrUrl: vqrData.qrLink || fallbackQrUrl,
                  orderId,
                  amount,
                  content,
                  data: vqrData
                }));
                return;
              }
            } catch (err) {
              console.warn('VietQR generate error:', err);
            }
          }

          res.end(JSON.stringify({
            success: true,
            source: 'vietqr_quicklink',
            qrUrl: fallbackQrUrl,
            orderId,
            amount,
            content
          }));
        });

        // 3. Endpoint Kiểm Tra Giao Dịch MB Bank & VietQR
        server.middlewares.use('/api/check-payment', async (req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const code = (url.searchParams.get('code') || '').toUpperCase();
          const orderId = (url.searchParams.get('orderId') || url.searchParams.get('orderCode') || '').toUpperCase();
          const amount = Number(url.searchParams.get('amount') || 0);
          let vietqrToken = url.searchParams.get('vietqrToken') || process.env.VIETQR_TOKEN || '';
          if (!vietqrToken) vietqrToken = await getSystemToken();
          const sepayToken = url.searchParams.get('token') || process.env.SEPAY_API_TOKEN || '';

          res.setHeader('Content-Type', 'application/json');

          // Bước 1: Master PIN check (cho quản trị viên hoặc test bypass)
          if (['0986019623', '8888', '9999', 'SOATDON', 'VIP', 'VIP888'].includes(code)) {
            res.end(JSON.stringify({ 
              success: true, 
              verified: true, 
              method: 'master_code', 
              message: 'Xác thực thành công bằng Mã Quản Trị!' 
            }));
            return;
          }

          // Bước 2: Kiểm tra webhook callback cache từ VietQR
          const checkKey = orderId || code;
          if (global.__PAID_TRANSACTIONS__ && checkKey) {
            for (const [key, tx] of global.__PAID_TRANSACTIONS__.entries()) {
              if (key.includes(checkKey) || (orderId && key.includes(orderId))) {
                if (amount <= 0 || tx.amount >= (amount - 1000)) {
                  res.end(JSON.stringify({
                    success: true,
                    verified: true,
                    method: 'vietqr_callback',
                    transaction: tx,
                    message: 'Tự động phát hiện thanh toán VietQR thành công qua Webhook!'
                  }));
                  return;
                }
              }
            }
          }

          // Bước 3: Tra cứu trực tiếp VietQR check-order nếu có token
          if (vietqrToken && (orderId || code)) {
            try {
              const checkRes = await fetch('https://api.vietqr.org/vqr/api/transactions/check-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${vietqrToken}`
                },
                body: JSON.stringify({
                  bankAccount: '0986019623',
                  type: 0,
                  value: orderId || code
                })
              });
              if (checkRes.ok) {
                const data = await checkRes.json();
                if (data.status === 1 || data.status === 'PAID' || data.status === 'SUCCESS') {
                  res.end(JSON.stringify({
                    success: true,
                    verified: true,
                    method: 'vietqr_api_direct',
                    data,
                    message: 'VietQR xác nhận đơn hàng đã thanh toán thành công!'
                  }));
                  return;
                }
              }
            } catch (err) {
              console.warn('VietQR check error:', err);
            }
          }

          // Bước 4: SePay Live API check (dự phòng)
          if (sepayToken) {
            try {
              const apiRes = await fetch('https://my.sepay.vn/userapi/transactions/list', {
                headers: { 'Authorization': `Bearer ${sepayToken}` }
              });
              if (apiRes.ok) {
                const data = await apiRes.json();
                const txs = data.transactions || data.data || [];
                const matched = txs.find(tx => {
                  const content = String(tx.transaction_content || tx.description || '').toUpperCase();
                  const txAmount = parseFloat(tx.amount_in || tx.amount || 0);
                  const matchCode = (code && content.includes(code)) || (orderId && content.includes(orderId));
                  const matchAmount = amount <= 0 || txAmount >= (amount - 1000);
                  return matchCode && matchAmount;
                });
                if (matched) {
                  res.end(JSON.stringify({ 
                    success: true, 
                    verified: true, 
                    method: 'sepay_auto', 
                    transaction: matched,
                    message: 'Tự động phát hiện chuyển khoản MB Bank thành công!'
                  }));
                  return;
                }
              }
            } catch (err) {
              console.error('Local SePay query error:', err);
            }
          }

          // Bước 5: CHƯA THANH TOÁN -> TRẢ VỀ VERIFIED: FALSE (KHÔNG MỞ KHÓA!)
          res.end(JSON.stringify({ 
            success: false, 
            verified: false, 
            orderId: orderId || code,
            amount,
            message: 'Chưa phát hiện biến động số dư trên MB Bank 0986019623. Vui lòng chuyển khoản đúng số tiền và thử lại sau 15-30 giây.' 
          }));
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
});
