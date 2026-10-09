import fs from 'fs';
import * as XLSX from 'xlsx';

// Danh sách họ tên, tỉnh thành thực tế
const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const MID_NAMES = ['Văn', 'Thị', 'Đức', 'Hữu', 'Ngọc', 'Thanh', 'Quang', 'Minh', 'Hải', 'Thu', 'Kim', 'Xuân', 'Hoàng'];
const LAST_NAMES = ['Anh', 'Bình', 'Cường', 'Dũng', 'Em', 'Giang', 'Hương', 'Hùng', 'Hạnh', 'Khánh', 'Linh', 'Long', 'Mai', 'Nam', 'Nga', 'Phương', 'Quân', 'Sơn', 'Trang', 'Tú', 'Uyên', 'Vinh', 'Yến'];

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Bắc Ninh', 'Quảng Ninh', 'Thanh Hóa',
  'Nghệ An', 'Nam Định', 'Thái Nguyên', 'Lâm Đồng', 'Khánh Hòa',
  'Đắk Lắk', 'Kiên Giang', 'An Giang', 'Vĩnh Phúc', 'Hải Dương'
];

const CARRIERS = [
  { name: 'GHTK', prefix: 'GHTK', baseFee: 22000 },
  { name: 'Giao Hàng Nhanh', prefix: 'GHN', baseFee: 24000 },
  { name: 'Shopee Xpress (SPX)', prefix: 'SPX', baseFee: 18000 },
  { name: 'Viettel Post', prefix: 'VTP', baseFee: 23000 },
  { name: 'TikTok Shop Express', prefix: 'TK', baseFee: 20000 }
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TOTAL_ORDERS = 300;
const orders = [];

for (let i = 1; i <= TOTAL_ORDERS; i++) {
  const carrierObj = randomChoice(CARRIERS);
  const orderCodeShop = `SHOP-2026-${String(1000 + i).padStart(4, '0')}`;
  const trackingNumber = `${carrierObj.prefix}-${randomInt(10000000, 99999999)}`;
  const customerName = `${randomChoice(FIRST_NAMES)} ${randomChoice(MID_NAMES)} ${randomChoice(LAST_NAMES)}`;
  const phone = `09${randomInt(10, 99)}***${randomInt(100, 999)}`;
  const destination = randomChoice(PROVINCES);
  
  // Trọng lượng gói hàng thực tế shop đóng (áo, váy, mỹ phẩm: 150g - 400g)
  const shopWeightGram = randomInt(15, 40) * 10; // 150g - 400g
  const codAmount = randomChoice([150000, 190000, 240000, 280000, 320000, 390000, 450000, 520000, 680000, 750000, 890000]);
  const expectedFee = carrierObj.baseFee;

  let billedWeightGram = shopWeightGram;
  let billedFee = expectedFee;
  let status = 'Giao hàng thành công';
  let note = 'Giao thành công, ký nhận đúng người.';
  let length = 20, width = 15, height = 5;

  // Tạo ra các trường hợp bất thường thực tế theo tỷ lệ
  const randType = Math.random();

  // 1. Nhảy cân / Kê khống trọng lượng (10% số đơn)
  if (randType < 0.10) {
    // Hãng kê lên 750g - 1600g (vượt mốc 500g tính thêm nấc 2 hoặc nấc 3)
    billedWeightGram = shopWeightGram + randomInt(45, 120) * 10;
    const extraWeightSteps = Math.ceil((billedWeightGram - 500) / 500);
    const surcharge = Math.max(1, extraWeightSteps) * randomChoice([11000, 16000, 22000]);
    billedFee = expectedFee + surcharge;
    status = 'Giao hàng thành công';
    note = `Bưu cục cập nhật cân nặng bưu phẩm: ${billedWeightGram}g. Thu thêm phụ phí vượt cân +${surcharge.toLocaleString('vi-VN')}đ.`;
  }
  // 2. Ngâm hàng hoàn lâu ngày > 7 - 10 ngày (4% số đơn - rủi ro thất thoát mất kiện hàng COD cao)
  else if (randType < 0.14) {
    status = 'Chuyển hoàn bưu cục (> 8 ngày)';
    billedFee = expectedFee + 10000; // phí hoàn
    note = `Người nhận không nghe máy 3 lần. Đơn hàng lưu tại kho phát bưu cục ${destination} từ ngày 28/09 chưa xuất trả về shop.`;
  }
  // 3. Phụ phí bất thường / Sai lệch cước vô lý (5% số đơn)
  else if (randType < 0.19) {
    const extraFee = randomChoice([15000, 20000, 25000, 35000]);
    billedFee = expectedFee + extraFee;
    status = 'Giao hàng thành công';
    note = `Phát sinh phụ phí vùng xa / phụ phí đổi địa chỉ tuyến huyện +${extraFee.toLocaleString('vi-VN')}đ.`;
  }
  // 4. Đơn hàng chuẩn (81% còn lại)
  else {
    billedWeightGram = shopWeightGram;
    billedFee = expectedFee;
    status = 'Giao hàng thành công';
    note = 'Đúng cước, đúng cân nặng.';
  }

  // Ngày gửi trong tháng
  const day = randomInt(1, 28);
  const createdDate = `2026-09-${String(day).padStart(2, '0')}`;
  const deliveredDate = `2026-09-${String(Math.min(30, day + randomInt(1, 4))).padStart(2, '0')}`;

  orders.push({
    "STT": i,
    "Mã Đơn Hàng Đối Tác": orderCodeShop,
    "Mã Vận Đơn Bưu Cục": trackingNumber,
    "Đơn Vị Vận Chuyển": carrierObj.name,
    "Người Nhận": customerName,
    "Điện Thoại Người Nhận": phone,
    "Tỉnh/Thành Nhận": destination,
    "Trọng Lượng Khai Báo (gram)": shopWeightGram,
    "Trọng Lượng Bưu Cục Cân (gram)": billedWeightGram,
    "Kích Thước Dài (cm)": length,
    "Kích Thước Rộng (cm)": width,
    "Kích Thước Cao (cm)": height,
    "Cước Dự Kiến Ban Đầu (VNĐ)": expectedFee,
    "Cước Vận Chuyển Thực Thu (VNĐ)": billedFee,
    "Tiền Thu Hộ COD (VNĐ)": codAmount,
    "Trạng Thái Giao Hàng": status,
    "Ngày Tạo Đơn": createdDate,
    "Ngày Giao Thành Công/Ngày Hoàn": deliveredDate,
    "Ghi Chú Vận Hành Của Bưu Cục": note
  });
}

// Tạo file Excel
const ws = XLSX.utils.json_to_sheet(orders);

// Căn chỉnh độ rộng các cột cho đẹp mắt chuyên nghiệp
ws['!cols'] = [
  { wch: 6 },  // STT
  { wch: 18 }, // Mã đơn shop
  { wch: 22 }, // Mã vận đơn
  { wch: 22 }, // Đơn vị VC
  { wch: 20 }, // Người nhận
  { wch: 16 }, // SĐT
  { wch: 18 }, // Tỉnh thành
  { wch: 26 }, // Trọng lượng shop
  { wch: 28 }, // Trọng lượng bưu cục
  { wch: 16 }, // Dài
  { wch: 16 }, // Rộng
  { wch: 16 }, // Cao
  { wch: 24 }, // Cước dự kiến
  { wch: 26 }, // Cước thực thu
  { wch: 22 }, // Tiền COD
  { wch: 30 }, // Trạng thái
  { wch: 14 }, // Ngày tạo
  { wch: 26 }, // Ngày giao/hoàn
  { wch: 55 }  // Ghi chú
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Bang_Ke_Doi_Soat_300_Don");

const outPublicDir = './public';
if (!fs.existsSync(outPublicDir)) {
  fs.mkdirSync(outPublicDir, { recursive: true });
}

const outPublicPath = './public/Bang_Ke_Doi_Soat_Chi_Tiet_300_Don.xlsx';
const outRootPath = './Bang_Ke_Doi_Soat_Chi_Tiet_300_Don.xlsx';

XLSX.writeFile(wb, outPublicPath);
XLSX.writeFile(wb, outRootPath);

console.log(`✅ Đã tạo thành công file Excel 300 đơn hàng:`);
console.log(`- Public URL: ${outPublicPath}`);
console.log(`- Root Path: ${outRootPath}`);
