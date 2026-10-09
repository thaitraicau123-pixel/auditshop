import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'api-payment-checker',
      configureServer(server) {
        server.middlewares.use('/api/check-payment', async (req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const code = (url.searchParams.get('code') || '').toUpperCase();
          const amount = Number(url.searchParams.get('amount') || 0);
          const orderCode = url.searchParams.get('orderCode') || '';
          const token = url.searchParams.get('token') || process.env.SEPAY_API_TOKEN || '';

          res.setHeader('Content-Type', 'application/json');

          // 1. Master PIN check
          if (['0986019623', '8888', '9999', 'SOATDON', 'VIP', 'VIP888'].includes(code)) {
            res.end(JSON.stringify({ 
              success: true, 
              verified: true, 
              method: 'master_code', 
              message: 'Xác thực thành công bằng Mã Quản Trị!' 
            }));
            return;
          }

          // 2. SePay Live API check if configured
          if (token) {
            try {
              const apiRes = await fetch('https://my.sepay.vn/userapi/transactions/list', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (apiRes.ok) {
                const data = await apiRes.json();
                const txs = data.transactions || data.data || [];
                const matched = txs.find(tx => {
                  const content = String(tx.transaction_content || tx.description || '').toUpperCase();
                  const txAmount = parseFloat(tx.amount_in || tx.amount || 0);
                  const matchCode = (code && content.includes(code)) || (orderCode && content.includes(orderCode));
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

          // 3. Not found yet
          res.end(JSON.stringify({ 
            success: false, 
            verified: false, 
            message: 'Chưa phát hiện biến động số dư trên sao kê MB Bank 0986019623.' 
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
