import * as XLSX from 'xlsx';
import { SAMPLE_ORDERS } from './sampleData';

/**
 * Làm sạch và chuyển đổi số tiền hoặc trọng lượng kiểu Việt Nam (1.000, 25,5, 1,2kg, 250g)
 */
export function parseVnNumber(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  let str = String(val).trim().toLowerCase().replace(/[^\d.,-]/g, '');
  if (!str) return defaultVal;
  
  // Xử lý dấu âm nếu có (ví dụ: -16000 hoặc +16000)
  const isNegative = str.startsWith('-');
  str = str.replace(/-/g, '');

  if (str.includes('.') && !str.includes(',')) {
    const parts = str.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, '');
    }
  } else if (str.includes(',') && !str.includes('.')) {
    const parts = str.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(',', '.');
    }
  } else if (str.includes('.') && str.includes(',')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  }
  let num = parseFloat(str);
  if (isNaN(num)) return defaultVal;
  return isNegative ? -num : num;
}

/**
 * Chuẩn hóa trọng lượng về đơn vị GRAM (Khắc phục lỗi file ghi theo kg: 0.25kg, 1.2kg vs 250g)
 */
export function normalizeWeightToGram(val, defaultVal = 250) {
  let num = parseVnNumber(val, defaultVal);
  if (num <= 0) return defaultVal;
  // Nếu số nhỏ hơn hoặc bằng 25 (ví dụ 0.15, 0.25, 0.5, 1.2, 2.5 kg) -> chắc chắn đơn vị là KG!
  if (num < 25) {
    num = Math.round(num * 1000);
  }
  return num;
}

/**
 * Phân tích chuyên sâu dữ liệu đơn hàng với khả năng nhận diện các cột chênh lệch đã tính trước
 */
export function analyzeOrders(ordersData) {
  const anomalies = [];
  const normalOrders = [];

  let totalWeightLeakage = 0;
  let totalReturnLeakage = 0;
  let totalFeeLeakage = 0;
  let totalCodLeakage = 0;

  ordersData.forEach((order, index) => {
    // Trường hợp đã có sẵn cờ issueType từ mẫu
    if (order.issueType && order.issueType !== "NORMAL") {
      if (order.issueType === "WEIGHT_INFLATION") {
        totalWeightLeakage += order.leakAmount;
      } else if (order.issueType === "RETURN_STALLED") {
        totalReturnLeakage += order.leakAmount;
      } else if (order.issueType === "FEE_ANOMALY") {
        totalFeeLeakage += order.leakAmount;
      } else if (order.issueType === "COD_DISCREPANCY") {
        totalCodLeakage += order.leakAmount;
      }
      anomalies.push({
        ...order,
        index: index + 1,
        isLocked: true
      });
      return;
    }

    // Đơn hàng đã được bồi thường / đền bù xong -> không tính thất thoát
    if (order.isCompensated) {
      normalOrders.push({
        ...order,
        issueType: "NORMAL",
        issueDetail: "✅ Đơn hàng đã được hãng bồi thường / đền bù hoàn tất."
      });
      return;
    }

    const shopWeight = normalizeWeightToGram(order.shopWeight, 250);
    const billedWeight = normalizeWeightToGram(order.billedWeight, shopWeight);
    const expectedFee = parseVnNumber(order.expectedFee, 22000);
    const billedFee = parseVnNumber(order.billedFee, expectedFee);
    const cod = parseVnNumber(order.cod, 0);
    const status = String(order.status || "");
    const auditNote = String(order.auditNote || "").toLowerCase();
    const paymentMethod = String(order.paymentMethod || "");

    // Số liệu tài chính kế toán bán hàng (nếu file có định dạng sổ sách bán hàng / đối soát doanh thu)
    const qty = parseVnNumber(order.qty, 1);
    const price = parseVnNumber(order.price, 0);
    const rawSubtotal = parseVnNumber(order.rawSubtotal, 0);
    const correctSubtotal = (price > 0 && qty > 0) ? (qty * price) : rawSubtotal;
    const discount = parseVnNumber(order.discount, 0);
    const customerShip = parseVnNumber(order.customerShip, 0);
    const calculatedTotalDue = parseVnNumber(order.calculatedTotalDue, 0) || (correctSubtotal > 0 ? (correctSubtotal - discount + customerShip) : 0);
    const actualReceived = parseVnNumber(order.actualReceived, cod);
    const platformFee = parseVnNumber(order.platformFee, 0);
    const carrierFee = parseVnNumber(order.carrierFee, billedFee);

    // Các cột chênh lệch đã tính sẵn trong file Excel (nếu có)
    const rawFeeDiff = Math.abs(parseVnNumber(order.feeDiff, 0));
    const rawWeightDiff = normalizeWeightToGram(order.weightDiff, 0);
    const rawCodDiff = Math.abs(parseVnNumber(order.codDiff, 0));

    let issue = null;

    // === NHÓM 1: BẢNG KẾ TOÁN BÁN HÀNG / ĐỐI SOÁT DOANH THU & SHIPPER (BẢNG THỰC HÀNH KẾ TOÁN) ===
    
    // 1.1. Lỗi tính toán: Số lượng * Đơn giá bị nhập tay sai
    if (rawSubtotal > 0 && price > 0 && qty > 0 && rawSubtotal !== correctSubtotal) {
      const diff = Math.abs(correctSubtotal - rawSubtotal);
      totalCodLeakage += diff;
      issue = {
        issueType: "COD_DISCREPANCY",
        leakAmount: diff,
        issueDetail: `Lỗi tính toán: Số lượng (${qty}) * Đơn giá (${price.toLocaleString('vi-VN')} đ) = ${correctSubtotal.toLocaleString('vi-VN')} đ, nhưng ô thành tiền gõ nhầm ${rawSubtotal.toLocaleString('vi-VN')} đ (Thất thoát trực tiếp ${diff.toLocaleString('vi-VN')} đ).`
      };
    }
    // 1.2. Hàng Bom / Chuyển hoàn nhưng kế toán vẫn hạch toán thu tiền về
    else if (
      status.toLowerCase().includes('bom') || 
      (status.toLowerCase().includes('hoàn') && (status.toLowerCase().includes('chuyển') || status.toLowerCase().includes('không nhận') || status.toLowerCase().includes('boom')))
    ) {
      const orderVal = (calculatedTotalDue > 0 ? calculatedTotalDue : actualReceived) || 480000;
      const shipReturn = carrierFee > 0 ? carrierFee : 15000;
      const loss = orderVal + shipReturn;
      totalReturnLeakage += loss;
      issue = {
        issueType: "RETURN_STALLED",
        leakAmount: loss,
        issueDetail: `Hàng Bom / Chuyển hoàn nhưng vẫn ghi nhận doanh thu: Thực tế không thu được tiền khách (0 đ) và mất thêm ${shipReturn.toLocaleString('vi-VN')} đ cước ship hoàn. Ghi ảo doanh thu ${orderVal.toLocaleString('vi-VN')} đ.`
      };
    }
    // 1.3. Lệch cước vận chuyển (ĐVVC đội cước vượt xa mức thỏa thuận / ship báo khách)
    else if (customerShip > 0 && carrierFee > customerShip + 10000) {
      const diff = carrierFee - customerShip;
      totalWeightLeakage += diff;
      issue = {
        issueType: "WEIGHT_INFLATION",
        leakAmount: diff,
        issueDetail: `Lệch cước vận chuyển: Báo khách ship ${customerShip.toLocaleString('vi-VN')} đ nhưng ĐVVC trừ cước thực tế ${carrierFee.toLocaleString('vi-VN')} đ (+${diff.toLocaleString('vi-VN')} đ do đội cước quá cân hoặc tính sai cước).`
      };
    }
    // 1.4. Sàn TMĐT trừ phí hoa hồng/dịch vụ quá mức (> 16% giá trị đơn)
    else if (platformFee > 0 && calculatedTotalDue > 0 && (platformFee / calculatedTotalDue > 0.16)) {
      const normalFee = Math.round(calculatedTotalDue * 0.10);
      const diff = platformFee - normalFee;
      totalFeeLeakage += diff;
      issue = {
        issueType: "FEE_ANOMALY",
        leakAmount: diff,
        issueDetail: `Sàn TMĐT trừ phí hoa hồng/dịch vụ quá mức: Phí sàn bị trừ ${platformFee.toLocaleString('vi-VN')} đ (${((platformFee / calculatedTotalDue) * 100).toFixed(1)}%), dự kiến chuẩn 10% (${normalFee.toLocaleString('vi-VN')} đ). Nghi ngờ tính trùng phí voucher/dịch vụ (+${diff.toLocaleString('vi-VN')} đ).`
      };
    }
    // 1.5. Lệch COD (ĐVVC thu thiếu tiền) hoặc Khách chuyển khoản thiếu (so với Tổng Cần Thu)
    else if (calculatedTotalDue > 0 && actualReceived > 0 && actualReceived < calculatedTotalDue - 2000) {
      const diff = calculatedTotalDue - actualReceived;
      totalCodLeakage += diff;
      if (paymentMethod.toLowerCase().includes('chuyển khoản')) {
        issue = {
          issueType: "COD_DISCREPANCY",
          leakAmount: diff,
          issueDetail: `Khách chuyển khoản thiếu: Tổng đơn cần thu ${calculatedTotalDue.toLocaleString('vi-VN')} đ nhưng sao kê thực tế chỉ nhận ${actualReceived.toLocaleString('vi-VN')} đ (Shop bị thiếu ${diff.toLocaleString('vi-VN')} đ).`
        };
      } else {
        issue = {
          issueType: "COD_DISCREPANCY",
          leakAmount: diff,
          issueDetail: `Lệch COD (ĐVVC thu thiếu tiền): Cần thu ${calculatedTotalDue.toLocaleString('vi-VN')} đ nhưng ĐVVC chỉ trả ${actualReceived.toLocaleString('vi-VN')} đ (Shop bị thất thoát ${diff.toLocaleString('vi-VN')} đ).`
        };
      }
    }

    // === NHÓM 2: FILE ĐỐI SOÁT VẬN CHUYỂN NVC TIÊU CHUẨN (GHTK, GHN, Viettel Post, SPX) ===
    else if (rawFeeDiff > 0) {
      if (rawWeightDiff > 100 || billedWeight > shopWeight + 150) {
        const weightChênh = rawWeightDiff > 0 ? rawWeightDiff : (billedWeight - shopWeight);
        totalWeightLeakage += rawFeeDiff;
        issue = {
          issueType: "WEIGHT_INFLATION",
          leakAmount: rawFeeDiff,
          issueDetail: `🚨 [Bảng kê xác nhận lệch cước]: Phụ phí chênh lệch +${rawFeeDiff.toLocaleString('vi-VN')} đ do nhảy cân từ ${shopWeight}g lên ${billedWeight}g (+${weightChênh}g).`
        };
      } else {
        totalFeeLeakage += rawFeeDiff;
        issue = {
          issueType: "FEE_ANOMALY",
          leakAmount: rawFeeDiff,
          issueDetail: `🚨 [Bảng kê xác nhận chênh lệch cước]: Cước thực thu bị đội thêm +${rawFeeDiff.toLocaleString('vi-VN')} đ so với biểu phí thỏa thuận ban đầu.`
        };
      }
    }
    else if (rawWeightDiff > 100) {
      const diffFee = billedFee > expectedFee ? (billedFee - expectedFee) : Math.max(11000, Math.ceil(rawWeightDiff / 500) * 11000);
      totalWeightLeakage += diffFee;
      issue = {
        issueType: "WEIGHT_INFLATION",
        leakAmount: diffFee,
        issueDetail: `🚨 [Bảng kê ghi nhận lệch cân]: Bưu cục kê chênh +${rawWeightDiff}g (Shop: ${shopWeight}g → Bưu cục: ${billedWeight}g). Phát sinh chênh cước +${diffFee.toLocaleString('vi-VN')} đ.`
      };
    }
    else if (
      auditNote.includes('lệch') || 
      auditNote.includes('kê khống') || 
      auditNote.includes('vượt cân') || 
      auditNote.includes('sai cước') ||
      auditNote.includes('phụ phí') ||
      auditNote.includes('bất thường') ||
      auditNote.includes('ngâm') ||
      auditNote.includes('chưa trả')
    ) {
      if (auditNote.includes('hoàn') || auditNote.includes('ngâm') || auditNote.includes('chưa trả') || auditNote.includes('lưu kho')) {
        const loss = cod > 0 ? cod : billedFee;
        totalReturnLeakage += loss;
        issue = {
          issueType: "RETURN_STALLED",
          leakAmount: loss,
          issueDetail: `⚠️ [Cảnh báo đối soát]: ${order.auditNote || 'Đơn chuyển hoàn ngâm bưu cục chưa xuất trả về shop. Nguy cơ thất thoát kiện hàng.'}`
        };
      } else if (auditNote.includes('cân') || auditNote.includes('trọng lượng')) {
        const diff = billedFee > expectedFee ? (billedFee - expectedFee) : 16000;
        totalWeightLeakage += diff;
        issue = {
          issueType: "WEIGHT_INFLATION",
          leakAmount: diff,
          issueDetail: `⚠️ [Cảnh báo đối soát]: ${order.auditNote || `Nhảy cân: Bưu cục tính ${billedWeight}g so với ${shopWeight}g khai báo.`}`
        };
      } else {
        const diff = billedFee > expectedFee ? (billedFee - expectedFee) : 15000;
        totalFeeLeakage += diff;
        issue = {
          issueType: "FEE_ANOMALY",
          leakAmount: diff,
          issueDetail: `⚠️ [Cảnh báo đối soát]: ${order.auditNote || 'Cước thực thu sai lệch so với thỏa thuận.'}`
        };
      }
    }
    // 2.1. Check nhảy cân tự động khi có cột trọng lượng thực sự
    else if (order.hasWeightCol && billedWeight >= shopWeight + 150 && billedFee > expectedFee) {
      const diff = billedFee - expectedFee;
      totalWeightLeakage += diff;
      issue = {
        issueType: "WEIGHT_INFLATION",
        leakAmount: diff,
        issueDetail: `Hãng nhảy cân: ${billedWeight}g so với ${shopWeight}g khai báo (Chênh +${billedWeight - shopWeight}g). Cước bị đội thêm ${diff.toLocaleString('vi-VN')} đ.`
      };
    } 
    // 2.2. Check đơn hoàn ngâm kho / giam hàng
    else if (
      status.toLowerCase().includes("hoàn") || 
      status.toLowerCase().includes("return") || 
      status.toLowerCase().includes("giam") ||
      status.toLowerCase().includes("lưu kho") ||
      status.toLowerCase().includes("thất lạc") ||
      status.toLowerCase().includes("mất hàng")
    ) {
      const loss = cod > 0 ? cod : 250000;
      totalReturnLeakage += loss;
      issue = {
        issueType: "RETURN_STALLED",
        leakAmount: loss,
        issueDetail: `Đơn chuyển hoàn có dấu hiệu ngâm lâu bưu cục chưa trả về shop. Nguy cơ mất kiện hàng trị giá ${loss.toLocaleString('vi-VN')} đ.`
      };
    }
    // 2.3. Check cước bưu cục thực thu cao hơn cước dự kiến (CHỈ ÁP DỤNG KHI FILE CÓ CỘT CƯỚC DỰ KIẾN THẬT SỰ)
    else if (order.hasExpectedFeeCol && billedFee > expectedFee + 4000) {
      const diff = billedFee - expectedFee;
      totalFeeLeakage += diff;
      issue = {
        issueType: "FEE_ANOMALY",
        leakAmount: diff,
        issueDetail: `Cước thực thu (${billedFee.toLocaleString('vi-VN')} đ) cao hơn cước thỏa thuận (${expectedFee.toLocaleString('vi-VN')} đ) +${diff.toLocaleString('vi-VN')} đ (nghi ngờ bị trừ phụ phí vùng sâu/phí đổi địa chỉ vô lý).`
      };
    }
    // 2.4. Check chênh lệch tiền thu hộ COD
    else if (rawCodDiff > 5000) {
      totalCodLeakage += rawCodDiff;
      issue = {
        issueType: "COD_DISCREPANCY",
        leakAmount: rawCodDiff,
        issueDetail: `Sai lệch tiền thu hộ COD: Chênh lệch ${rawCodDiff.toLocaleString('vi-VN')} đ giữa tiền khách trả và tiền bưu cục chuyển về tài khoản.`
      };
    }

    if (issue) {
      anomalies.push({
        ...order,
        ...issue,
        shopWeight,
        billedWeight,
        expectedFee,
        billedFee,
        cod,
        index: index + 1,
        isLocked: true
      });
    } else {
      normalOrders.push({
        ...order,
        shopWeight,
        billedWeight,
        expectedFee,
        billedFee,
        cod
      });
    }
  });

  const totalLeakage = totalWeightLeakage + totalReturnLeakage + totalFeeLeakage + totalCodLeakage;

  return {
    totalOrders: ordersData.length,
    anomalyCount: anomalies.length,
    normalCount: normalOrders.length,
    totalLeakage,
    breakdown: {
      weight: totalWeightLeakage,
      returns: totalReturnLeakage,
      fee: totalFeeLeakage,
      cod: totalCodLeakage
    },
    anomalies,
    sortedAnomalies: [...anomalies].sort((a, b) => b.leakAmount - a.leakAmount)
  };
}

/**
 * Đọc file Excel từ File Input với thuật toán quét thông minh:
 * - Dò tìm hàng tiêu đề thực sự kể cả khi có nhiều dòng tiêu đề/thông tin phụ phía trên
 * - Nhận diện đa dạng tên cột của tất cả các hãng vận chuyển (GHTK, GHN, Viettel Post, SPX, TikTok...)
 * - Tự động nhận diện các cột đã tính sẵn chênh lệch cước, chênh lệch cân nặng
 * - Loại bỏ các dòng tổng cộng / thống kê
 */
export async function parseExcelFile(file, aiSchema = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          throw new Error("File Excel không có dữ liệu đơn hàng.");
        }

        // Chuyển đổi an toàn mọi hàng thành mảng chuỗi chuẩn
        const getSafeRowStrings = (row) => {
          if (!row) return [];
          const len = row.length || 0;
          const result = [];
          for (let i = 0; i < len; i++) {
            result.push(row[i] !== null && row[i] !== undefined ? String(row[i]).trim().toLowerCase() : '');
          }
          return result;
        };

        // Thuật toán dò tìm hàng tiêu đề thông minh trong 25 dòng đầu tiên
        let headerRowIdx = 0;
        let maxMatchScore = -1;
        const keywords = [
          'mã', 'tracking', 'đơn', 'code', 'vận đơn', 'hãng', 'cước', 
          'khối lượng', 'cân nặng', 'thu hộ', 'cod', 'trạng thái', 'người nhận',
          'chênh lệch', 'lệch', 'phụ phí', 'bồi thường', 'bưu cục'
        ];

        const maxScanRows = Math.min(json.length, 25);
        for (let r = 0; r < maxScanRows; r++) {
          const rowCells = getSafeRowStrings(json[r]);
          let score = 0;
          for (let c = 0; c < rowCells.length; c++) {
            const cellVal = rowCells[c];
            if (cellVal && keywords.some(k => k && cellVal.includes(k))) {
              score++;
            }
          }
          if (score > maxMatchScore) {
            maxMatchScore = score;
            headerRowIdx = r;
          }
        }

        const headers = getSafeRowStrings(json[headerRowIdx]);

        // Helper tìm index của cột
        const findCol = (kwList) => {
          return headers.findIndex(h => {
            if (!h || typeof h !== 'string') return false;
            return kwList.some(k => k && typeof k === 'string' && h.includes(k.toLowerCase()));
          });
        };

        const idIdx = findCol(['mã vận đơn bưu cục', 'mã vận đơn', 'mã bưu gửi', 'tracking', 'mã kiện', 'mã tra cứu', 'mã đơn hàng', 'mã đơn', 'order id', 'mã']);
        const carrierIdx = findCol(['kênh bán', 'đơn vị vận chuyển', 'hãng vận chuyển', 'đvvc', 'carrier', 'vận chuyển', 'đối tác', 'đơn vị', 'kênh']);
        const shopWeightIdx = findCol(['khai báo', 'shop cân', 'trọng lượng shop', 'cân nặng shop', 'khối lượng shop', 'trọng lượng ban đầu', 'kg khai báo']);
        const billedWeightIdx = findCol(['bưu cục cân', 'bưu cục', 'hãng cân', 'thực tế', 'tính cước', 'trọng lượng tính cước', 'cân nặng thực tế', 'khối lượng tính cước', 'trọng lượng qđ', 'quy đổi', 'trọng lượng bưu cục']);
        const expectedFeeIdx = findCol(['cước dự kiến', 'phí ban đầu', 'tạm tính', 'cước gốc', 'phí chuẩn', 'thỏa thuận']);
        const billedFeeIdx = findCol(['phí ship đvvc báo', 'cước vận chuyển thực thu', 'cước thực thu', 'thực tính', 'phí giao', 'tổng cước', 'cước thực', 'phí ship', 'thực thu', 'tổng phí', 'chi phí']);
        const codIdx = findCol(['tiền thực thu về tk/cod', 'tiền thực thu', 'thực thu về tk', 'tiền thu hộ cod', 'tiền cod', 'thu hộ', 'cod', 'giá trị thu hộ', 'tiền thu hộ']);
        const statusIdx = findCol(['trạng thái đơn', 'trạng thái', 'tình trạng', 'status', 'kết quả giao', 'tiến trình']);
        const customerIdx = findCol(['người nhận', 'khách hàng', 'tên khách', 'họ tên']);
        
        // Các cột sổ sách bán hàng / đối soát doanh thu
        const productIdx = findCol(['sản phẩm', 'tên hàng']);
        const qtyIdx = findCol(['sl', 'số lượng']);
        const priceIdx = findCol(['đơn giá', 'giá bán']);
        const subtotalIdx = findCol(['tiền hàng', 'thành tiền']);
        const discountIdx = findCol(['voucher/giảm', 'giảm giá', 'voucher', 'chiết khấu']);
        const customerShipIdx = findCol(['ship khách trả', 'cước khách trả', 'tiền ship']);
        const totalDueIdx = findCol(['tổng cần thu', 'cần thu', 'tổng thu']);
        const paymentMethodIdx = findCol(['hình thức tt', 'phương thức thanh toán', 'hình thức']);
        const platformFeeIdx = findCol(['phí sàn', 'hoa hồng sàn']);

        // Nhận diện các cột chênh lệch đã tính trước (Pre-calculated columns)
        const feeDiffIdx = findCol(['chênh lệch cần thu vs thực thu', 'chênh lệch cước', 'cước chênh lệch', 'cước chênh', 'phí chênh lệch', 'tiền chênh lệch', 'chênh lệch phí', 'cước phát sinh', 'phụ phí phát sinh', 'tiền lệch', 'lệch cước', 'phí vượt', 'phụ phí']);
        const weightDiffIdx = findCol(['chênh lệch trọng lượng', 'chênh lệch cân nặng', 'chênh lệch khối lượng', 'lệch cân', 'trọng lượng lệch', 'cân lệch', 'khối lượng lệch', 'chênh cân', 'vượt cân']);
        const codDiffIdx = findCol(['chênh lệch cod', 'lệch cod', 'chênh lệch tiền thu hộ', 'lệch tiền thu hộ']);
        const auditNoteIdx = findCol(['kết quả đối soát', 'cảnh báo đối soát', 'trạng thái đối soát', 'kết quả kiểm tra', 'tình trạng đối soát', 'kết luận', 'khiếu nại', 'ghi chú đối soát', 'cảnh báo lệch', 'đánh giá', 'ghi chú']);
        const carrierCompensatedIdx = findCol(['hãng đền bù', 'bồi thường', 'tiền bồi thường', 'đã đền bù', 'đã hoàn tiền', 'đã giải quyết']);

        // Kích thước thể tích (nếu có)
        const lengthIdx = findCol(['dài', 'length']);
        const widthIdx = findCol(['rộng', 'width']);
        const heightIdx = findCol(['cao', 'height']);

        const hasWeightCol = shopWeightIdx >= 0 || billedWeightIdx >= 0;
        const hasExpectedFeeCol = expectedFeeIdx >= 0;

        const rows = [];
        for (let r = headerRowIdx + 1; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0) continue;

          // Bỏ qua dòng rỗng hoặc dòng tổng cộng/thống kê
          const firstCell = String(row[0] || '').toLowerCase().trim();
          const secondCell = String(row[1] || '').toLowerCase().trim();
          const isSummaryRow = ['tổng', 'tổng cộng', 'cộng', 'total', 'subtotal', 'bình quân', 'trung bình', 'báo cáo'].some(k => 
            firstCell.includes(k) || secondCell.includes(k)
          );
          if (isSummaryRow) continue;

          // Lấy mã vận đơn
          const rawId = idIdx >= 0 ? row[idIdx] : (row[0] || row[1]);
          if (!rawId || String(rawId).trim() === '' || String(rawId).toLowerCase().includes('tổng cộng')) continue;

          // Đọc các trường kế toán bán hàng
          const qty = qtyIdx >= 0 ? parseVnNumber(row[qtyIdx], 1) : 1;
          const price = priceIdx >= 0 ? parseVnNumber(row[priceIdx], 0) : 0;
          const rawSubtotal = subtotalIdx >= 0 ? parseVnNumber(row[subtotalIdx], 0) : 0;
          const discount = discountIdx >= 0 ? parseVnNumber(row[discountIdx], 0) : 0;
          const customerShip = customerShipIdx >= 0 ? parseVnNumber(row[customerShipIdx], 0) : 0;
          const platformFee = platformFeeIdx >= 0 ? parseVnNumber(row[platformFeeIdx], 0) : 0;
          const paymentMethod = paymentMethodIdx >= 0 ? String(row[paymentMethodIdx] || '') : 'COD';

          const correctSubtotal = (price > 0 && qty > 0) ? (qty * price) : (rawSubtotal || 0);
          let calculatedTotalDue = (correctSubtotal > 0) ? (correctSubtotal - discount + customerShip) : 0;
          if (totalDueIdx >= 0 && parseVnNumber(row[totalDueIdx], 0) > 0) {
            calculatedTotalDue = parseVnNumber(row[totalDueIdx], 0);
          }

          // Tính trọng lượng quy đổi thể tích (D x R x C / 5000) nếu có
          let volumetricWeight = 0;
          if (lengthIdx >= 0 && widthIdx >= 0 && heightIdx >= 0) {
            const l = parseVnNumber(row[lengthIdx], 0);
            const w = parseVnNumber(row[widthIdx], 0);
            const h = parseVnNumber(row[heightIdx], 0);
            if (l > 0 && w > 0 && h > 0) {
              volumetricWeight = Math.round((l * w * h) / 5); // quy đổi ra gram
            }
          }

          let shopW = shopWeightIdx >= 0 ? normalizeWeightToGram(row[shopWeightIdx], 250) : 250;
          if (volumetricWeight > shopW) {
            shopW = volumetricWeight;
          }

          let billedW = billedWeightIdx >= 0 ? normalizeWeightToGram(row[billedWeightIdx], shopW) : shopW;

          // Cột chênh lệch cân nặng tính trước (nếu có)
          const weightDiff = weightDiffIdx >= 0 ? normalizeWeightToGram(row[weightDiffIdx], 0) : 0;
          if (weightDiff > 0 && billedW <= shopW) {
            billedW = shopW + weightDiff;
          }

          const expFee = expectedFeeIdx >= 0 ? parseVnNumber(row[expectedFeeIdx], customerShip || 22000) : (customerShip || 22000);
          const billedFee = billedFeeIdx >= 0 ? parseVnNumber(row[billedFeeIdx], expFee) : expFee;
          const feeDiff = feeDiffIdx >= 0 ? parseVnNumber(row[feeDiffIdx], 0) : 0;
          const codDiff = codDiffIdx >= 0 ? parseVnNumber(row[codDiffIdx], 0) : 0;
          const codVal = codIdx >= 0 ? parseVnNumber(row[codIdx], 0) : (calculatedTotalDue || 0);
          const st = statusIdx >= 0 ? String(row[statusIdx] || '') : 'Giao thành công';
          const auditNote = auditNoteIdx >= 0 ? String(row[auditNoteIdx] || '').trim() : '';
          const isCompensated = carrierCompensatedIdx >= 0 
            ? (parseVnNumber(row[carrierCompensatedIdx], 0) > 0 || String(row[carrierCompensatedIdx] || '').toLowerCase().includes('đã'))
            : false;

          rows.push({
            id: String(rawId).trim(),
            carrier: carrierIdx >= 0 && row[carrierIdx] ? String(row[carrierIdx]).trim() : 'Giao hàng',
            customer: customerIdx >= 0 && row[customerIdx] ? String(row[customerIdx]).trim() : 'Khách hàng',
            phone: '09******',
            date: new Date().toISOString().split('T')[0],
            shopWeight: shopW,
            billedWeight: billedW,
            weightDiff,
            expectedFee: expFee,
            billedFee: billedFee,
            feeDiff,
            codDiff,
            cod: codVal,
            status: st,
            auditNote,
            isCompensated,
            hasWeightCol,
            hasExpectedFeeCol,
            // Các trường kế toán
            qty,
            price,
            rawSubtotal,
            correctSubtotal,
            discount,
            customerShip,
            calculatedTotalDue,
            actualReceived: codVal,
            carrierFee: billedFee,
            platformFee,
            paymentMethod
          });
        }

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Tải file Excel mẫu 300 đơn về máy để người dùng thử nghiệm
 */
export function downloadSampleExcel() {
  const link = document.createElement('a');
  link.href = '/Bang_Ke_Doi_Soat_Chi_Tiet_300_Don.xlsx';
  link.download = 'Bang_Ke_Doi_Soat_Chi_Tiet_300_Don.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
