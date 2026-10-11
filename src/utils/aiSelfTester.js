import * as XLSX from 'xlsx';
import { parseExcelWorkbook, analyzeOrders } from './auditEngine.js';

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

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Tự động tạo 1 bộ dữ liệu Excel ngẫu nhiên với Ground Truth (đáp án chuẩn)
 */
export function generateTestDataset(numOrders = 50, scenarioType = 'MIXED') {
  const groundTruthAnomalies = [];
  const rawRows = [];

  for (let i = 1; i <= numOrders; i++) {
    const carrier = randomChoice(CARRIERS);
    const orderId = `${carrier.prefix}-${randomInt(10000000, 99999999)}`;
    const customer = `Khách Hàng ${i}`;
    const address = randomChoice(PROVINCES);
    const shopWeight = randomInt(15, 40) * 10; // 150g - 400g
    const expectedFee = carrier.baseFee;
    const codAmount = randomChoice([150000, 200000, 280000, 350000, 480000, 600000]);

    let billedWeight = shopWeight;
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

    if (shouldInjectAnomaly) {
      const anomalyKind = randomChoice(['WEIGHT', 'FEE', 'RETURN', 'COD_ARITHMETIC', 'COMPENSATED_CLEAN']);

      // 1. Nhảy cân (Kê khống trọng lượng)
      if (anomalyKind === 'WEIGHT') {
        billedWeight = shopWeight + randomInt(30, 80) * 10;
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
      // 4. Lỗi tính toán kế toán (Số lượng * Đơn giá gõ sai)
      else if (anomalyKind === 'COD_ARITHMETIC') {
        const qty = 2;
        const price = 200000;
        const correctSubtotal = 400000;
        const fakeSubtotal = 300000;
        const diff = correctSubtotal - fakeSubtotal;
        groundTruth = {
          orderId,
          type: 'COD_DISCREPANCY',
          leakAmount: diff,
          customData: { qty, price, rawSubtotal: fakeSubtotal }
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

    const rowObj = {
      "Mã Vận Đơn": orderId,
      "Đơn Vị VC": carrier.name,
      "Người Nhận": customer,
      "Tỉnh/Thành Nhận": address,
      "Trọng Lượng Khai Báo (gram)": shopWeight,
      "Trọng Lượng Bưu Cục (gram)": billedWeight,
      "Cước Dự Kiến": expectedFee,
      "Cước Thực Thu": billedFee,
      "Tiền Thu Hộ COD": codAmount,
      "Trạng Thái": status,
      "Ghi Chú Đối Soát": auditNote,
      "Bồi Thường": isCompensated ? 'Đã đền bù' : ''
    };

    if (groundTruth && groundTruth.customData) {
      rowObj["Số Lượng"] = groundTruth.customData.qty;
      rowObj["Đơn Giá"] = groundTruth.customData.price;
      rowObj["Thành Tiền"] = groundTruth.customData.rawSubtotal;
    }

    rawRows.push(rowObj);
  }

  const ws = XLSX.utils.json_to_sheet(rawRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Doi_Soat_Tu_Dong");

  return {
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
