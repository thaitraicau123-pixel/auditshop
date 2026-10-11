/**
 * Test kịch bản thực tế: Đăng nhập đa thiết bị (Cross-Device Cloud Sync Test)
 * Mô phỏng:
 * - Thiết bị A (Máy tính 1): Đăng ký tài khoản shop mới lên Cloud DB
 * - Thiết bị B (Máy tính 2 / Điện thoại): Đăng nhập bằng tài khoản vừa tạo (không có cache từ máy A)
 * - Thiết bị C (Admin): Nâng cấp gói cước và cộng số dư lượt quét lên Cloud DB
 * - Thiết bị B (Máy tính 2): Tải lại số dư và kiểm tra xem đã nhận được số dư mới chưa
 */

const MASTER_BIN_ID = 'acbecad';
const CLOUD_URL = `https://extendsclass.com/api/json-storage/bin/${MASTER_BIN_ID}`;

async function runTest() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM TRA ĐĂNG NHẬP ĐA THIẾT BỊ (CROSS-DEVICE CLOUD SYNC)');
  console.log('🎯 Cloud DB Endpoint:', CLOUD_URL);
  console.log('====================================================\n');

  // Bước 1: Kiểm tra kết nối tới Cloud Database
  console.log('1️⃣ Đang kết nối tới Cloud Database...');
  const res1 = await fetch(`${CLOUD_URL}?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res1.ok) {
    throw new Error(`Không thể kết nối Cloud DB, HTTP status: ${res1.status}`);
  }
  const dbData = await res1.json();
  console.log(`✅ Kết nối thành công! Đang có ${(dbData.accounts || []).length} tài khoản trong hệ thống Cloud.`);

  // Bước 2: Thiết bị A đăng ký tài khoản mới
  const testPhone = '0988' + Math.floor(100000 + Math.random() * 900000);
  const testPassword = 'pass_' + Math.floor(1000 + Math.random() * 9000);
  const testShop = 'Shop Test May A ' + Math.floor(100 + Math.random() * 900);

  console.log(`\n2️⃣ [THIẾT BỊ A] Đăng ký tài khoản mới:`);
  console.log(`   - Tên shop: ${testShop}`);
  console.log(`   - Số điện thoại: ${testPhone}`);
  console.log(`   - Mật khẩu: ${testPassword}`);

  dbData.accounts = dbData.accounts || [];
  const newUser = {
    id: 'USR_TEST_' + Date.now(),
    shopName: testShop,
    phone: testPhone,
    password: testPassword,
    balanceScans: 3,
    plan: 'standard',
    registeredAt: new Date().toISOString()
  };
  dbData.accounts.push(newUser);
  dbData.updatedAt = new Date().toISOString();

  const putRes = await fetch(CLOUD_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(dbData)
  });
  if (!putRes.ok) {
    throw new Error(`[Thiết bị A] Không thể ghi dữ liệu lên Cloud: HTTP ${putRes.status}`);
  }
  console.log('   ✅ Đã lưu tài khoản lên Cloud Database!');

  // Bước 3: Thiết bị B (Một máy tính hoàn toàn khác) đăng nhập
  console.log(`\n3️⃣ [THIẾT BỊ B - MÁY TÍNH KHÁC] Thử đăng nhập bằng số điện thoại & mật khẩu vừa tạo:`);
  const res2 = await fetch(`${CLOUD_URL}?_t=${Date.now()}_deviceB`, { headers: { 'Cache-Control': 'no-cache' } });
  const cloudDataDeviceB = await res2.json();

  const foundUser = (cloudDataDeviceB.accounts || []).find(
    a => a.phone === testPhone && a.password === testPassword
  );

  if (!foundUser) {
    console.error('   ❌ THẤT BẠI: Thiết bị B không tìm thấy tài khoản vừa tạo trên Cloud!');
    process.exit(1);
  }
  console.log('   ✅ ĐĂNG NHẬP THÀNH CÔNG TRÊN THIẾT BỊ B!');
  console.log(`   - Tên shop nhận diện: ${foundUser.shopName}`);
  console.log(`   - Số dư ban đầu: ${foundUser.balanceScans} lượt`);

  // Bước 4: Thiết bị C (Admin) cộng thêm 20 lượt và nâng cấp VIP
  console.log(`\n4️⃣ [ADMIN] Cộng thêm 20 lượt quét và nâng cấp gói VIP Tháng:`);
  const idx = cloudDataDeviceB.accounts.findIndex(a => a.phone === testPhone);
  cloudDataDeviceB.accounts[idx].balanceScans += 20;
  cloudDataDeviceB.accounts[idx].plan = 'monthly';
  cloudDataDeviceB.updatedAt = new Date().toISOString();

  await fetch(CLOUD_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(cloudDataDeviceB)
  });
  console.log('   ✅ Admin đã cập nhật dữ liệu lên Cloud!');

  // Bước 5: Thiết bị B kiểm tra lại số dư
  console.log(`\n5️⃣ [THIẾT BỊ B] Đồng bộ lại thông tin tài khoản từ Cloud:`);
  const res3 = await fetch(`${CLOUD_URL}?_t=${Date.now()}_checkB`, { headers: { 'Cache-Control': 'no-cache' } });
  const cloudDataFinal = await res3.json();
  const updatedUserB = (cloudDataFinal.accounts || []).find(a => a.phone === testPhone);

  console.log(`   - Số dư hiện tại trên Thiết Bị B: ${updatedUserB.balanceScans} lượt (Kỳ vọng: 23 lượt)`);
  console.log(`   - Gói cước hiện tại trên Thiết Bị B: ${updatedUserB.plan} (Kỳ vọng: monthly)`);

  if (updatedUserB.balanceScans === 23 && updatedUserB.plan === 'monthly') {
    console.log('\n====================================================');
    console.log('🎉 KẾT QUẢ: ĐĂNG NHẬP ĐA THIẾT BỊ HOẠT ĐỘNG HOÀN HẢO 100%!');
    console.log('Tài khoản tạo từ máy A lập tức đăng nhập và sử dụng được trên máy B!');
    console.log('====================================================\n');
  } else {
    console.error('❌ Dữ liệu không khớp kỳ vọng!');
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Lỗi kiểm tra:', err);
  process.exit(1);
});
