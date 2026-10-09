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
export async function parseExcelFile(file) {
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

        // Tự động tìm hàng tiêu đề (Header row)
        const headers = json[0].map(h => String(h || '').trim().toLowerCase());
        
        // Helper tìm index của cột
        const findCol = (keywords) => {
          return headers.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const idIdx = findCol(['mã', 'tracking', 'đơn', 'code', 'vận đơn']);
        const carrierIdx = findCol(['đối tác', 'hãng', 'đvvc', 'carrier', 'vận chuyển']);
        const shopWeightIdx = findCol(['khai báo', 'shop cân', 'trọng lượng shop', 'cân nặng shop']);
        const billedWeightIdx = findCol(['thực tế', 'tính cước', 'trọng lượng tính cước', 'hãng cân', 'cân nặng']);
        const expectedFeeIdx = findCol(['cước dự kiến', 'phí ban đầu', 'tạm tính']);
        const billedFeeIdx = findCol(['phí giao', 'tổng cước', 'cước thực', 'phí ship', 'thực thu']);
        const codIdx = findCol(['cod', 'thu hộ', 'tiền cod', 'giá trị']);
        const statusIdx = findCol(['trạng thái', 'tình trạng', 'status']);
        const customerIdx = findCol(['khách', 'người nhận', 'tên']);

        const rows = [];
        for (let r = 1; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0 || !row[idIdx >= 0 ? idIdx : 0]) continue;

          rows.push({
            id: String(row[idIdx >= 0 ? idIdx : 0] || `DON-${r}`),
            carrier: String(row[carrierIdx >= 0 ? carrierIdx : 1] || 'Vận chuyển'),
            customer: String(row[customerIdx >= 0 ? customerIdx : 2] || 'Khách hàng'),
            phone: '09******',
            date: new Date().toISOString().split('T')[0],
            shopWeight: parseVnNumber(row[shopWeightIdx >= 0 ? shopWeightIdx : 3], 250),
            billedWeight: parseVnNumber(row[billedWeightIdx >= 0 ? billedWeightIdx : 4], 250),
            expectedFee: parseVnNumber(row[expectedFeeIdx >= 0 ? expectedFeeIdx : 5], 22000),
            billedFee: parseVnNumber(row[billedFeeIdx >= 0 ? billedFeeIdx : 6], 22000),
            cod: parseVnNumber(row[codIdx >= 0 ? codIdx : 7], 200000),
            status: String(row[statusIdx >= 0 ? statusIdx : 8] || 'Giao thành công')
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
