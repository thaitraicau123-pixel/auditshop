import * as XLSX from 'xlsx';
import { parseExcelWorkbook, analyzeOrders, removeVietnameseTones } from './auditEngine.js';

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Bắc Ninh', 'Quảng Ninh', 'Thanh Hóa',
  'Nghệ An', 'Nam Định', 'Thái Nguyên', 'Lâm Đồng', 'Khánh Hòa'
];

const CARRIERS = [
  { name: 'Giao Hàng Tiết Kiệm (GHTK)', prefix: 'GHTK', baseFee: 22000 },
  { name: 'Giao Hàng Nhanh (GHN)', prefix: 'GHN', baseFee: 24000 },
  { name: 'Viettel Post', prefix: 'VTP', baseFee: 23000 },
  { name: 'Shopee Xpress (SPX)', prefix: 'SPX', baseFee: 18000 },
  { name: 'TikTok Shop Express', prefix: 'TK', baseFee: 20000 }
];

const TEMPLATES = ['GHTK', 'GHN', 'VTP', 'SPX', 'TIKTOK', 'ACCOUNTING'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format số tiền kiểu lộn xộn thực tế (dirty currency formats)
 */
function formatDirtyMoney(val, style = 'normal') {
  if (style === 'raw') return val;
  if (style === 'dot_vnd') return `${val.toLocaleString('vi-VN')} đ`;
  if (style === 'comma') return `${val.toLocaleString('en-US')}`;
  if (style === 'vnd_text') return `${val.toLocaleString('vi-VN')} VNĐ`;
  if (style === 'space') return ` ${val.toLocaleString('vi-VN')} `;
  return val;
}

/**
 * Format trọng lượng kiểu lộn xộn thực tế (kg, gram, g, dấu phẩy)
 */
function formatDirtyWeight(gramVal, style = 'normal') {
  if (style === 'raw_gram') return gramVal;
  if (style === 'suffix_g') return `${gramVal}g`;
  if (style === 'suffix_gram') return `${gramVal} gram`;
  if (style === 'kg_dot') return `${(gramVal / 1000).toFixed(2)} kg`;
  if (style === 'kg_comma') return `${(gramVal / 1000).toFixed(2).replace('.', ',')} kg`;
  if (style === 'kg_num') return Number((gramVal / 1000).toFixed(3));
  return gramVal;
}

/**
 * Tự động tạo một file Excel ngẫu nhiên với 6 định dạng và nhiều kiểu dữ liệu hỗn tạp
 */
export function generateTestDataset(numOrders = 50, scenarioType = 'MIXED', chosenTemplate = 'RANDOM') {
  const groundTruthAnomalies = [];
  const rawRows = [];

  const template = chosenTemplate === 'RANDOM' ? randomChoice(TEMPLATES) : chosenTemplate;
  const isDirtyFormatting = Math.random() < 0.6; // 60% file có dữ liệu định dạng hỗn tạp
  const isNoAccents = Math.random() < 0.2; // 20% file không dấu (ERP/POS cũ)

  for (let i = 1; i <= numOrders; i++) {
    const carrier = randomChoice(CARRIERS);
    const orderId = `${carrier.prefix}-${randomInt(10000000, 99999999)}`;
    const customer = `Khách Hàng ${i}`;
    const address = randomChoice(PROVINCES);
    const shopWeightGram = randomInt(15, 40) * 10; // 150g - 400g
    const expectedFee = carrier.baseFee;
    const codAmount = randomChoice([150000, 200000, 280000, 350000, 480000, 600000]);

    let billedWeightGram = shopWeightGram;
    let billedFee = expectedFee;
    let status = 'Giao hàng thành công';
    let auditNote = '';
    let isCompensated = false;
    let groundTruth = null;

    let shouldInjectAnomaly = false;
    if (scenarioType === 'CLEAN') {
      shouldInjectAnomaly = false;
    } else if (scenarioType === 'HEAVY') {
      shouldInjectAnomaly = Math.random() < 0.6;
    } else {
      shouldInjectAnomaly = Math.random() < 0.25;
    }

    let codDiff = 0;
    let extraData = {};

    if (shouldInjectAnomaly) {
      const anomalyKind = randomChoice(['WEIGHT', 'FEE', 'RETURN', 'COD_DISCREPANCY', 'COMPENSATED_CLEAN']);

      // 1. Nhảy cân (Kê khống trọng lượng)
      if (anomalyKind === 'WEIGHT') {
        billedWeightGram = shopWeightGram + randomInt(30, 80) * 10;
        const surcharge = randomChoice([11000, 16000, 22000]);
        billedFee = expectedFee + surcharge;
        groundTruth = {
          orderId,
          type: 'WEIGHT_INFLATION',
          leakAmount: surcharge
        };
      }
      // 2. Lệch cước vận chuyển / Phụ phí khống
      else if (anomalyKind === 'FEE') {
        const extraFee = randomChoice([15000, 20000, 25000, 30000]);
        billedFee = expectedFee + extraFee;
        auditNote = `Phát sinh phụ phí vượt cước +${extraFee}đ`;
        groundTruth = {
          orderId,
          type: 'FEE_ANOMALY',
          leakAmount: extraFee
        };
      }
      // 3. Đơn chuyển hoàn ngâm bưu cục > 8 ngày
      else if (anomalyKind === 'RETURN') {
        status = 'Chuyển hoàn bưu cục (> 10 ngày)';
        auditNote = 'Đơn hàng lưu kho phát bưu cục quá 8 ngày chưa hoàn trả về shop';
        groundTruth = {
          orderId,
          type: 'RETURN_STALLED',
          leakAmount: codAmount
        };
      }
      // 4. Lệch thu COD / Lỗi tính toán kế toán
      else if (anomalyKind === 'COD_DISCREPANCY') {
        const diff = randomChoice([50000, 100000, 150000]);
        codDiff = diff;
        auditNote = `Bưu cục chuyển thiếu tiền COD ${diff}đ`;
        if (template === 'ACCOUNTING') {
          const qty = 2;
          const price = 200000;
          const fakeSubtotal = (qty * price) - diff;
          extraData = { qty, price, rawSubtotal: fakeSubtotal };
        }
        groundTruth = {
          orderId,
          type: 'COD_DISCREPANCY',
          leakAmount: diff,
          customData: extraData
        };
      }
      // 5. Đơn hàng đã bồi thường (Không được báo động giả)
      else if (anomalyKind === 'COMPENSATED_CLEAN') {
        isCompensated = true;
        status = 'Hàng thất lạc (Bưu cục đã đền bù 100%)';
        auditNote = 'Đã nhận tiền bồi thường từ bưu cục';
        groundTruth = null;
      }
    }

    if (groundTruth) {
      groundTruthAnomalies.push(groundTruth);
    }

    // Định dạng dữ liệu (Dirty formatting nếu bật)
    const weightStyle = isDirtyFormatting ? randomChoice(['raw_gram', 'suffix_g', 'suffix_gram', 'kg_dot', 'kg_comma', 'kg_num']) : 'raw_gram';
    const moneyStyle = isDirtyFormatting ? randomChoice(['raw', 'dot_vnd', 'comma', 'vnd_text', 'space']) : 'raw';

    const formattedShopWeight = formatDirtyWeight(shopWeightGram, weightStyle);
    const formattedBilledWeight = formatDirtyWeight(billedWeightGram, weightStyle);
    const formattedExpectedFee = formatDirtyMoney(expectedFee, moneyStyle);
    const formattedBilledFee = formatDirtyMoney(billedFee, moneyStyle);
    const formattedCod = formatDirtyMoney(codAmount, moneyStyle);

    let rowObj = {};

    // 1. TEMPLATE GHTK
    if (template === 'GHTK') {
      rowObj = {
        "Mã vận đơn": orderId,
        "Mã đơn hàng riêng": `SHOP-${randomInt(1000, 9999)}`,
        "Tên người nhận": customer,
        "Số điện thoại": `09${randomInt(10, 99)}***`,
        "Địa chỉ giao": address,
        "Trọng lượng khai báo": formattedShopWeight,
        "Trọng lượng tính cước": formattedBilledWeight,
        "Cước phí ban đầu": formattedExpectedFee,
        "Cước thực thu": formattedBilledFee,
        "Tiền CoD": formattedCod,
        "Chênh lệch COD": formatDirtyMoney(codDiff, moneyStyle),
        "Trạng thái": status,
        "Ghi chú đối soát": auditNote,
        "Bồi thường": isCompensated ? 'Đã đền bù' : ''
      };
    }
    // 2. TEMPLATE GHN
    else if (template === 'GHN') {
      rowObj = {
        "Mã bưu gửi": orderId,
        "Mã đơn": `GHN-${randomInt(1000, 9999)}`,
        "Người nhận": customer,
        "Tỉnh/Thành nhận": address,
        "Khối lượng shop (gram)": formattedShopWeight,
        "Khối lượng bưu cục (gram)": formattedBilledWeight,
        "Cước dự kiến": formattedExpectedFee,
        "Tổng cước DV": formattedBilledFee,
        "Tiền thu hộ": formattedCod,
        "Chênh lệch COD": formatDirtyMoney(codDiff, moneyStyle),
        "Trạng thái đơn hàng": status,
        "Lý do hoàn": auditNote,
        "Bồi thường": isCompensated ? 'Đã bồi thường' : ''
      };
    }
    // 3. TEMPLATE VIETTEL POST (KG Units)
    else if (template === 'VTP') {
      rowObj = {
        "MÃ VẬN ĐƠN": orderId,
        "MÃ ĐƠN KHÁCH": `VTP-${randomInt(1000, 9999)}`,
        "NGƯỜI NHẬN": customer,
        "ĐIỆN THOẠI": `09${randomInt(10, 99)}***`,
        "TỈNH THÀNH": address,
        "TRỌNG LƯỢNG KHAI BÁO (KG)": Number((shopWeightGram / 1000).toFixed(2)),
        "TRỌNG LƯỢNG TÍNH CƯỚC (KG)": Number((billedWeightGram / 1000).toFixed(2)),
        "CƯỚC CHÍNH": formattedExpectedFee,
        "TỔNG CƯỚC": formattedBilledFee,
        "TIỀN COD": formattedCod,
        "CHÊNH LỆCH COD": formatDirtyMoney(codDiff, moneyStyle),
        "TRẠNG THÁI": status,
        "GHI CHÚ": auditNote,
        "BỒI THƯỜNG": isCompensated ? 'Đã đền bù' : ''
      };
    }
    // 4. TEMPLATE SHOPEE XPRESS / SPX (English Headers)
    else if (template === 'SPX') {
      rowObj = {
        "Tracking No": orderId,
        "Order ID": `SPX-${randomInt(1000, 9999)}`,
        "Customer Name": customer,
        "Destination": address,
        "Declared Weight (kg)": Number((shopWeightGram / 1000).toFixed(2)),
        "Billed Weight (kg)": Number((billedWeightGram / 1000).toFixed(2)),
        "Initial Shipping Fee": formattedExpectedFee,
        "Actual Shipping Fee": formattedBilledFee,
        "COD Amount": formattedCod,
        "COD Discrepancy": formatDirtyMoney(codDiff, moneyStyle),
        "Delivery Status": status,
        "Remarks": auditNote,
        "Compensation": isCompensated ? 'Compensated' : ''
      };
    }
    // 5. TEMPLATE TIKTOK SHOP EXPRESS
    else if (template === 'TIKTOK') {
      rowObj = {
        "Mã tra cứu": orderId,
        "Mã đơn TikTok": `TK-${randomInt(1000, 9999)}`,
        "Khách mua": customer,
        "Khu vực": address,
        "Khối lượng shop": formattedShopWeight,
        "Khối lượng gói hàng": formattedBilledWeight,
        "Cước thỏa thuận": formattedExpectedFee,
        "Cước bưu cục trừ": formattedBilledFee,
        "Doanh thu COD": formattedCod,
        "Chênh lệch COD": formatDirtyMoney(codDiff, moneyStyle),
        "Trạng thái bưu kiện": status,
        "Đánh giá": auditNote,
        "Đã hoàn tiền": isCompensated ? 'Đã xử lý' : ''
      };
    }
    // 6. TEMPLATE BẢNG KẾ TOÁN BÁN HÀNG ĐA KÊNH
    else {
      const qty = extraData.qty || 1;
      const price = extraData.price || codAmount;
      const subtotal = extraData.rawSubtotal !== undefined ? extraData.rawSubtotal : (qty * price);
      const feeDiff = (billedFee > expectedFee) ? (billedFee - expectedFee) : 0;
      const weightDiff = (billedWeightGram > shopWeightGram) ? (billedWeightGram - shopWeightGram) : 0;

      rowObj = {
        "STT": i,
        "Mã Đơn": orderId,
        "Ngày Tạo": `2026-10-${String(randomInt(1, 10)).padStart(2, '0')}`,
        "Khách Hàng": customer,
        "Tỉnh Thành": address,
        "Số Lượng": qty,
        "Đơn Giá": formatDirtyMoney(price, moneyStyle),
        "Thành Tiền": formatDirtyMoney(subtotal, moneyStyle),
        "Voucher Giảm": 0,
        "Khối Lượng Khai Báo (g)": formattedShopWeight,
        "Khối Lượng Hãng Cân (g)": formattedBilledWeight,
        "Lệch Cân (g)": weightDiff,
        "Ship Khách Trả": formattedExpectedFee,
        "Phí Ship ĐVVC Báo": formattedBilledFee,
        "Lệch Cước": formatDirtyMoney(feeDiff, moneyStyle),
        "Tổng Cần Thu": formatDirtyMoney(subtotal, moneyStyle),
        "Hình Thức TT": "COD",
        "Thực Nhận Về TK": (status.includes('hoàn') || status.includes('Bom')) ? 0 : formattedCod,
        "Lệch Thu COD": formatDirtyMoney(codDiff, moneyStyle),
        "Trạng Thái Đơn": status,
        "Ghi Chú": auditNote,
        "Bồi Thường": isCompensated ? 'Đã đền bù' : ''
      };
    }

    // Nếu là chế độ không dấu (ASCII only)
    if (isNoAccents) {
      const noAccentObj = {};
      Object.keys(rowObj).forEach(k => {
        noAccentObj[removeVietnameseTones(k)] = rowObj[k];
      });
      rowObj = noAccentObj;
    }

    rawRows.push(rowObj);
  }

  // Tạo SheetJS Workbook
  const ws = XLSX.utils.json_to_sheet(rawRows);

  // Chèn Banner Header thực tế nếu là dirty format
  const hasBanner = isDirtyFormatting && Math.random() < 0.5;
  if (hasBanner) {
    XLSX.utils.sheet_add_aoa(ws, [
      [`CÔNG TY TNHH PHÂN PHỐI VẬN CHUYỂN TOÀN CẦU`],
      [`BẢNG ĐỐI SOÁT CƯỚC VÀ THU HỘ THÁNG 10/2026 - MẪU ${template}`],
      [`Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')} | Đơn vị: VNĐ`],
      [] // Dòng trống ngăn cách
    ], { origin: "A1" });
    // Dời lại JSON sheet xuống dưới banner
    XLSX.utils.sheet_add_json(ws, rawRows, { origin: "A5" });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Bảng_Kê_${template}`);

  return {
    template,
    hasBanner,
    isDirtyFormatting,
    isNoAccents,
    rawRows,
    wb,
    groundTruthAnomalies,
    expectedAnomalyCount: groundTruthAnomalies.length,
    expectedTotalLeakage: groundTruthAnomalies.reduce((sum, a) => sum + a.leakAmount, 0)
  };
}

/**
 * Đánh giá kết quả kiểm toán của 1 file vừa sinh
 */
export function evaluateSingleBatch(dataset) {
  const rows = parseExcelWorkbook(dataset.wb);
  const auditResult = analyzeOrders(rows);

  const gtMap = new Map(dataset.groundTruthAnomalies.map(a => [a.orderId, a]));
  const detectedMap = new Map(auditResult.anomalies.map(a => [a.id, a]));

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  const discrepancies = [];

  dataset.groundTruthAnomalies.forEach(gt => {
    if (detectedMap.has(gt.orderId)) {
      const detected = detectedMap.get(gt.orderId);
      if (Math.abs(detected.leakAmount - gt.leakAmount) <= 1000) {
        truePositives++;
      } else {
        discrepancies.push({
          orderId: gt.orderId,
          type: 'LEAKAGE_AMOUNT_MISMATCH',
          expected: gt.leakAmount,
          actual: detected.leakAmount,
          detail: `Số tiền lệch: Dự kiến ${gt.leakAmount} đ vs Thực tế ${detected.leakAmount} đ`
        });
      }
    } else {
      falseNegatives++;
      discrepancies.push({
        orderId: gt.orderId,
        type: 'MISSED_ANOMALY',
        expected: gt.type,
        leakAmount: gt.leakAmount,
        detail: `Bỏ sót đơn lỗi!`
      });
    }
  });

  auditResult.anomalies.forEach(detected => {
    if (!gtMap.has(detected.id)) {
      falsePositives++;
      discrepancies.push({
        orderId: detected.id,
        type: 'FALSE_POSITIVE',
        detectedType: detected.issueType,
        leakAmount: detected.leakAmount,
        detail: `Báo động giả! Đơn bình thường bị gắn cờ lỗi.`
      });
    }
  });

  const accuracy = (dataset.rawRows.length - (falsePositives + falseNegatives + discrepancies.filter(d => d.type === 'LEAKAGE_AMOUNT_MISMATCH').length)) / dataset.rawRows.length;

  return {
    template: dataset.template,
    isDirty: dataset.isDirtyFormatting,
    totalOrders: dataset.rawRows.length,
    expectedAnomalies: dataset.expectedAnomalyCount,
    detectedAnomalies: auditResult.anomalyCount,
    expectedLeakage: dataset.expectedTotalLeakage,
    detectedLeakage: auditResult.totalLeakage,
    truePositives,
    falsePositives,
    falseNegatives,
    discrepancies,
    isPerfect: discrepancies.length === 0 && falsePositives === 0 && falseNegatives === 0,
    accuracy: Math.max(0, accuracy)
  };
}

/**
 * Tải file Excel test vừa sinh về máy (dành cho browser)
 */
export function downloadDatasetAsExcel(dataset, fileName = 'Bang_Ke_Tu_Dong_Sinh_Test_AI.xlsx') {
  XLSX.writeFile(dataset.wb, fileName);
}
