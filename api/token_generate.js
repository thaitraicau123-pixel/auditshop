// Vercel Serverless Function: VietQR Get Token API (Chuẩn Basic Authentication)
// Phục vụ VietQR gọi vào để lấy Token xác thực trước khi gửi Callback biến động số dư

export default async function handler(req, res) {
  // CORS Headers
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

  // Hỗ trợ kiểm tra sức khỏe endpoint bằng GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ONLINE',
      service: 'VietQR Get Token API Endpoint (Basic Auth)',
      path: '/vqr/api/token_generate'
    });
  }

  try {
    let authHeader = req.headers.authorization || '';
    let username = '';
    let password = '';

    // Trích xuất từ Basic Auth Header: "Basic <base64(user:pass)>"
    if (authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.substring(6).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const parts = decoded.split(':');
      username = parts[0] || '';
      password = parts.slice(1).join(':') || '';
    } else {
      // Hoặc trích xuất từ body JSON nếu VietQR gửi qua payload
      const body = req.body || {};
      username = body.username || body.user || '';
      password = body.password || body.pass || '';
    }

    console.log(`[VietQR Get Token] Request from username: "${username}"`);

    // Kiểm tra cấu hình nếu có đặt biến môi trường
    const expectedUser = process.env.VIETQR_CLIENT_USERNAME;
    const expectedPass = process.env.VIETQR_CLIENT_PASSWORD;

    if (expectedUser && expectedPass) {
      if (username !== expectedUser || password !== expectedPass) {
        return res.status(401).json({
          code: '01',
          error: 'Unauthorized',
          message: 'Username hoặc Password xác thực từ VietQR không chính xác'
        });
      }
    }

    // Tạo Access Token động đạt chuẩn OAuth2 / Bearer Token của VietQR
    const tokenBytes = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const accessToken = `vqr_token_${tokenBytes}`;

    // Lưu token vào danh sách token hợp lệ
    if (!global.__VIETQR_VALID_TOKENS__) {
      global.__VIETQR_VALID_TOKENS__ = new Set();
    }
    global.__VIETQR_VALID_TOKENS__.add(accessToken);

    // Trả về kết quả đúng cấu trúc VietQR yêu cầu
    return res.status(200).json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 300,
      scope: 'read write',
      username: username || 'soatdon_admin',
      message: 'Get Token thành công'
    });

  } catch (error) {
    console.error('VietQR Get Token Error:', error);
    return res.status(500).json({
      code: '99',
      error: error.message
    });
  }
}
