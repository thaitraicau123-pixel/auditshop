import * as XLSX from 'xlsx';
import { SAMPLE_ORDERS } from './sampleData';

export function parseVnNumber(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  let str = String(val).trim().toLowerCase().replace(/[^\d.,]/g, '');
  if (!str) return defaultVal;
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
  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Phân tích dữ liệu từ file Excel hoặc dữ liệu mẫu
 */
export function analyzeOrders(ordersData) {
  const anomalies = [];
  const normalOrders = [];

  let totalWeightLeakage = 0;
  let totalReturnLeakage = 0;
  let totalFeeLeakage = 0;
  let totalCodLeakage = 0;

  ordersData.forEach((order, index) => {
    // 1. Kiểm tra kê khống cân nặng
    const shopWeight = parseVnNumber(order.shopWeight, 250);
    const billedWeight = parseVnNumber(order.billedWeight, 250);
    const expectedFee = parseVnNumber(order.expectedFee, 22000);
    const billedFee = parseVnNumber(order.billedFee, 22000);
    const cod = parseVnNumber(order.cod, 200000);
    const status = String(order.status || "");

    // Trường hợp đã có sẵn cờ issueType từ sample
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
        index: index + 1
      });
      return;
    }

    // Trường hợp tự phân tích từ file tải lên
    let issue = null;

    // Check cân nặng (Lệch trên 200g và phát sinh tiền cước)
    if (billedWeight > shopWeight + 200 && billedFee > expectedFee) {
      const diff = billedFee - expectedFee;
      totalWeightLeakage += diff;
      issue = {
        issueType: "WEIGHT_INFLATION",
        leakAmount: diff,
        issueDetail: `Hãng nhảy cân: ${billedWeight}g so với ${shopWeight}g khai báo (Chênh ${billedWeight - shopWeight}g). Cước đội thêm ${diff.toLocaleString('vi-VN')} đ.`
      };
    } 
    // Check đơn hoàn ngâm kho > 5 ngày
    else if (status.toLowerCase().includes("hoàn") || status.toLowerCase().includes("return")) {
      totalReturnLeakage += cod;
      issue = {
        issueType: "RETURN_STALLED",
        leakAmount: cod,
        issueDetail: `Đơn hoàn có dấu hiệu ngâm lâu chưa trả shop. Nguy cơ mất kiện hàng trị giá ${cod.toLocaleString('vi-VN')} đ.`
      };
    }
    // Check phí dịch vụ phụ thu bất thường
    else if (billedFee > expectedFee + 5000) {
      const diff = billedFee - expectedFee;
      totalFeeLeakage += diff;
      issue = {
        issueType: "FEE_ANOMALY",
        leakAmount: diff,
        issueDetail: `Cước thực thu cao hơn cước dự kiến ${diff.toLocaleString('vi-VN')} đ (nghi ngờ bị trừ phí vùng sâu/phí lưu kho ảo).`
      };
    }

    if (issue) {
      anomalies.push({
        ...order,
        ...issue,
        index: index + 1,
        isLocked: anomalies.length >= 3 // Chỉ cho xem 3 đơn đầu miễn phí
      });
    } else {
      normalOrders.push(order);
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
    // Sắp xếp đơn rủi ro cao nhất lên đầu
    sortedAnomalies: [...anomalies].sort((a, b) => b.leakAmount - a.leakAmount)
  };
}

/**
 * Đọc file Excel từ File Input
 */
/**
 * Đọc file Excel từ File Input với thuật toán dò tìm Header Row thông minh & Hỗ trợ AI
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

        // 1. THUẬT TOÁN TÌM HÀNG TIÊU ĐỀ THỰC SỰ (Header Row Detection)
        // Chuyển đổi an toàn mọi hàng thành mảng chuỗi đặc (dense array) tránh lỗi mảng thưa (sparse array)
        const getSafeRowStrings = (row) => {
          if (!row) return [];
          const len = row.length || 0;
          const result = [];
          for (let i = 0; i < len; i++) {
            result.push(row[i] !== null && row[i] !== undefined ? String(row[i]).trim().toLowerCase() : '');
          }
          return result;
        };

        let headerRowIdx = 0;
        let maxMatchScore = -1;
        const keywords = ['mã', 'tracking', 'đơn', 'code', 'vận đơn', 'hãng', 'cước', 'khối lượng', 'cân nặng', 'thu hộ', 'cod', 'trạng thái', 'người nhận'];

        const maxScanRows = Math.min(json.length, 15);
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

        // Helper tìm index của cột với an toàn tuyệt đối chống lỗi undefined .includes()
        const findCol = (kwList) => {
          return headers.findIndex(h => {
            if (!h || typeof h !== 'string') return false;
            return kwList.some(k => k && typeof k === 'string' && h.includes(k.toLowerCase()));
          });
        };

        const idIdx = findCol(['mã vận đơn', 'mã đơn', 'tracking', 'mã kiện', 'order id', 'mã bưu gửi', 'mã tra cứu', 'mã']);
        const carrierIdx = findCol(['đối tác', 'hãng vận chuyển', 'đvvc', 'carrier', 'vận chuyển', 'đơn vị']);
        const shopWeightIdx = findCol(['khai báo', 'shop cân', 'trọng lượng shop', 'cân nặng shop', 'khối lượng shop', 'trọng lượng ban đầu']);
        const billedWeightIdx = findCol(['hãng cân', 'thực tế', 'tính cước', 'trọng lượng tính cước', 'cân nặng thực tế', 'khối lượng tính cước', 'trọng lượng qđ', 'quy đổi']);
        const expectedFeeIdx = findCol(['cước dự kiến', 'phí ban đầu', 'tạm tính', 'cước gốc', 'phí chuẩn']);
        const billedFeeIdx = findCol(['cước thực thu', 'phí giao', 'tổng cước', 'cước thực', 'phí ship', 'thực thu', 'tổng phí', 'chi phí']);
        const codIdx = findCol(['tiền cod', 'thu hộ', 'cod', 'giá trị thu hộ', 'tiền thu hộ']);
        const statusIdx = findCol(['trạng thái', 'tình trạng', 'status', 'kết quả giao', 'tiến trình']);
        const customerIdx = findCol(['khách hàng', 'người nhận', 'tên khách', 'họ tên']);
        
        // Cột kích thước thể tích nếu có
        const lengthIdx = findCol(['dài', 'length']);
        const widthIdx = findCol(['rộng', 'width']);
        const heightIdx = findCol(['cao', 'height']);

        const rows = [];
        for (let r = headerRowIdx + 1; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0) continue;

          // Lấy mã vận đơn
          const rawId = idIdx >= 0 ? row[idIdx] : (row[0] || row[1]);
          if (!rawId || String(rawId).trim() === '' || String(rawId).toLowerCase().includes('tổng cộng')) continue;

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

          let shopW = shopWeightIdx >= 0 ? parseVnNumber(row[shopWeightIdx], 250) : 250;
          // Nếu có thể tích quy đổi lớn hơn cân nặng thực thì lấy thể tích
          if (volumetricWeight > shopW) {
            shopW = volumetricWeight;
          }

          const billedW = billedWeightIdx >= 0 ? parseVnNumber(row[billedWeightIdx], shopW) : shopW;
          const expFee = expectedFeeIdx >= 0 ? parseVnNumber(row[expectedFeeIdx], 22000) : 22000;
          const billedFee = billedFeeIdx >= 0 ? parseVnNumber(row[billedFeeIdx], expFee) : expFee;
          const codVal = codIdx >= 0 ? parseVnNumber(row[codIdx], 0) : 0;
          const st = statusIdx >= 0 ? String(row[statusIdx] || '') : 'Giao thành công';

          rows.push({
            id: String(rawId).trim(),
            carrier: carrierIdx >= 0 && row[carrierIdx] ? String(row[carrierIdx]).trim() : 'Giao hàng',
            customer: customerIdx >= 0 && row[customerIdx] ? String(row[customerIdx]).trim() : 'Khách hàng',
            phone: '09******',
            date: new Date().toISOString().split('T')[0],
            shopWeight: shopW,
            billedWeight: billedW,
            expectedFee: expFee,
            billedFee: billedFee,
            cod: codVal,
            status: st
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
 * Tải file Excel mẫu về máy để người dùng thử nghiệm
 */
export function downloadSampleExcel() {
  const ws = XLSX.utils.json_to_sheet(
    SAMPLE_ORDERS.map(o => ({
      "Mã Vận Đơn": o.id,
      "Đơn Vị Vận Chuyển": o.carrier,
      "Tên Khách Hàng": o.customer,
      "Số Điện Thoại": o.phone,
      "Trọng Lượng Khai Báo (gram)": o.shopWeight,
      "Trọng Lượng Tính Cước (gram)": o.billedWeight,
      "Cước Dự Kiến (VNĐ)": o.expectedFee,
      "Cước Thực Thu (VNĐ)": o.billedFee,
      "Tiền Thu Hộ COD (VNĐ)": o.cod,
      "Trạng Thái Giao Hàng": o.status
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachDonHang");
  XLSX.writeFile(wb, "Mau_Doi_Soat_Don_Hang_Thuc_Te.xlsx");
}
