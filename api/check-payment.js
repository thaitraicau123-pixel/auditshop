// Vercel Serverless Function: Tự động kiểm tra giao dịch chuyển khoản MB Bank qua SePay API
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
    const amount = Number(query.amount || body.amount || 0);
    const orderCode = String(query.orderCode || body.orderCode || '').trim();
    const token = String(
      query.token || 
      body.token || 
      req.headers.authorization?.replace('Bearer ', '') || 
      process.env.SEPAY_API_TOKEN || 
      ''
    ).trim();

    // 1. Kiểm tra mã quản trị / Master PIN
    const masterCodes = ['0986019623', '8888', '9999', 'SOATDON', 'VIP', 'VIP888'];
    if (code && masterCodes.includes(code)) {
      return res.status(200).json({
        success: true,
        verified: true,
        method: 'master_code',
        message: 'Xác thực thành công bằng Mã Quản Trị!'
      });
    }

    // 2. Nếu có SePay Token: Truy vấn giao dịch ngân hàng thực tế từ MB Bank
    if (token) {
      try {
        const sepayUrl = 'https://my.sepay.vn/userapi/transactions/list';
        const response = await fetch(sepayUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const transactions = data.transactions || data.data || [];

          // Tìm giao dịch trùng khớp
          const matchedTx = transactions.find(tx => {
            const content = String(tx.transaction_content || tx.description || '').toUpperCase();
            const txAmount = parseFloat(tx.amount_in || tx.amount || 0);

            // Kiểm tra nội dung chứa mã đơn hoặc mã chuyển khoản
            const matchCode = (code && content.includes(code)) || 
                              (orderCode && content.includes(orderCode));
            const matchAmount = amount <= 0 || txAmount >= (amount - 1000); // Cho phép sai số nhỏ nếu có phí

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
      } catch (apiErr) {
        console.error('SePay API lookup error:', apiErr);
      }
    }

    // 3. Nếu chưa tìm thấy giao dịch
    return res.status(200).json({
      success: false,
      verified: false,
      code,
      message: 'Chưa phát hiện giao dịch khớp trên hệ thống MB Bank 0986019623. Ngân hàng có thể trễ 1-3 phút.'
    });

  } catch (error) {
    console.error('Check payment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
