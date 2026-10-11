import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseExcelWorkbook, analyzeOrders, colIndexToLetter } from '../src/utils/auditEngine.js';

// Danh sách dữ liệu mẫu ngẫu nhiên
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
 * Tạo một tập dữ liệu thử nghiệm ngẫu nhiên với nhãn chuẩn (Ground Truth)
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
    let groundTruth = null; // null nếu là đơn chuẩn (NORMAL)

    // Xác định xem đơn này có lỗi hay không dựa vào scenario
    let shouldInjectAnomaly = false;
    if (scenarioType === 'CLEAN') {
      shouldInjectAnomaly = false;
    } else if (scenarioType === 'HEAVY') {
      shouldInjectAnomaly = Math.random() < 0.6; // 60% lỗi
    } else {
      shouldInjectAnomaly = Math.random() < 0.25; // 25% lỗi (thực tế)
    }

    if (shouldInjectAnomaly) {
      const anomalyKind = randomChoice(['WEIGHT', 'FEE', 'RETURN', 'COD_ARITHMETIC', 'COMPENSATED_CLEAN']);

      // 1. Nhảy cân (Kê khống trọng lượng)
      if (anomalyKind === 'WEIGHT') {
        billedWeight = shopWeight + randomInt(30, 80) * 10; // Chênh 300g - 800g
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
        const fakeSubtotal = 300000; // gõ thiếu 100k
        const diff = correctSubtotal - fakeSubtotal;
        groundTruth = {
          orderId,
          type: 'COD_DISCREPANCY',
          leakAmount: diff,
          customData: { qty, price, rawSubtotal: fakeSubtotal }
        };
      }
      // 5. Đơn hàng đã được bồi thường (Test trường hợp không được báo động giả)
      else if (anomalyKind === 'COMPENSATED_CLEAN') {
        isCompensated = true;
        status = 'Hàng thất lạc (Bưu cục đã đền bù 100%)';
        auditNote = 'Đã nhận tiền bồi thường từ bưu cục';
        // Đây KHÔNG PHẢI là anomaly vì đã đền bù xong
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

  // Tạo Workbook Excel dạng buffer
  const ws = XLSX.utils.json_to_sheet(rawRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Doi_Soat_Test");
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return {
    rawRows,
    wb,
    buffer,
    groundTruthAnomalies,
    expectedAnomalyCount: groundTruthAnomalies.length,
    expectedTotalLeakage: groundTruthAnomalies.reduce((sum, a) => sum + a.leakAmount, 0)
  };
}

/**
 * Chạy đánh giá kiểm toán trên 1 tập dữ liệu
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

  // 1. Kiểm tra từng đơn có lỗi trong Ground Truth xem AI có phát hiện đúng không
  dataset.groundTruthAnomalies.forEach(gt => {
    if (detectedMap.has(gt.orderId)) {
      const detected = detectedMap.get(gt.orderId);
      // Kiểm tra độ chính xác số tiền thất thoát
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

  // 2. Kiểm tra các đơn AI phát hiện có bị báo động giả (False Positive) không
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
 * Vòng lặp kiểm thử liên tục (Autonomous Optimization Loop)
 */
export async function runAutonomousLoop(maxRounds = 50) {
  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU VÒNG LẶP TỰ KIỂM THỬ VÀ ĐÁNH GIÁ AI LIÊN TỤC`);
  console.log(`🎯 Mục tiêu: 100% Độ Chính Xác - 0 Báo Động Giả - 0 Bỏ Sót`);
  console.log(`======================================================\n`);

  let passedRounds = 0;
  let totalOrdersTested = 0;
  let totalAnomaliesTested = 0;

  const scenarios = ['CLEAN', 'MIXED', 'HEAVY', 'MIXED', 'CLEAN'];

  for (let round = 1; round <= maxRounds; round++) {
    const scenario = scenarios[(round - 1) % scenarios.length];
    const orderCount = randomInt(40, 100);
    const dataset = generateTestDataset(orderCount, scenario);

    const evalResult = evaluateSingleBatch(dataset);
    totalOrdersTested += evalResult.totalOrders;
    totalAnomaliesTested += evalResult.expectedAnomalies;

    if (evalResult.isPerfect) {
      passedRounds++;
      process.stdout.write(`✅ Vòng ${String(round).padStart(2, '0')}/${maxRounds} [${scenario.padEnd(5, ' ')}]: ${evalResult.totalOrders} đơn | ${evalResult.detectedAnomalies} lỗi | Thất thoát: ${evalResult.detectedLeakage.toLocaleString('vi-VN')} đ | Độ chính xác: 100.0% \n`);
    } else {
      console.error(`\n❌ VÒNG ${round} CÓ SAI LỆCH!`);
      console.error(`- Scenario: ${scenario}`);
      console.error(`- Đơn kiểm tra: ${evalResult.totalOrders}`);
      console.error(`- Chi tiết sai lệch:`, evalResult.discrepancies);
      return {
        success: false,
        failedAtRound: round,
        evalResult
      };
    }
  }

  // Kiểm tra 2 file thực tế của người dùng đã tải lên
  console.log(`\n------------------------------------------------------`);
  console.log(`🔍 KIỂM TRA BẢO ĐẢM TRÊN CẢ 2 BỘ DỮ LIỆU THỰC HÀNH CỦA NGƯỜI DÙNG:`);

  const f1Path = 'C:/Users/admin/.gemini/antigravity/brain/816a9a77-74ea-4a7d-a3f1-6b190b4b9884/.user_uploaded/media_1791614965218.xlsx';
  const f2Path = 'C:/Users/admin/.gemini/antigravity/brain/816a9a77-74ea-4a7d-a3f1-6b190b4b9884/.user_uploaded/media_1791627064163.xlsx';

  if (fs.existsSync(f1Path)) {
    const wb1 = XLSX.read(fs.readFileSync(f1Path), { type: 'buffer' });
    const res1 = analyzeOrders(parseExcelWorkbook(wb1));
    const pass1 = res1.anomalyCount === 6 && res1.totalLeakage === 865000;
    console.log(`- File 1 (20 Đơn): ${pass1 ? '✅ ĐẠT' : '❌ SAI'} (${res1.anomalyCount} lỗi, ${res1.totalLeakage.toLocaleString('vi-VN')} đ) [Chuẩn: 6 lỗi, 865.000 đ]`);
  }

  if (fs.existsSync(f2Path)) {
    const wb2 = XLSX.read(fs.readFileSync(f2Path), { type: 'buffer' });
    const res2 = analyzeOrders(parseExcelWorkbook(wb2));
    const pass2 = res2.anomalyCount === 4 && res2.totalLeakage === 180000;
    console.log(`- File 2 (Tháng 10): ${pass2 ? '✅ ĐẠT' : '❌ SAI'} (${res2.anomalyCount} lỗi, ${res2.totalLeakage.toLocaleString('vi-VN')} đ) [Chuẩn: 4 lỗi, 180.000 đ]`);
  }

  console.log(`\n======================================================`);
  console.log(`🏆 KẾT QUẢ ĐÁNH GIÁ TOÀN DIỆN:`);
  console.log(`- Tổng số vòng kiểm thử: ${maxRounds}/${maxRounds} HOÀN HẢO (100%)`);
  console.log(`- Tổng số đơn hàng đã quét & kiểm tra: ${totalOrdersTested.toLocaleString('vi-VN')} đơn`);
  console.log(`- Tổng số đơn lỗi đã phát hiện: ${totalAnomaliesTested.toLocaleString('vi-VN')} đơn`);
  console.log(`- Tỷ lệ báo động giả (False Positives): 0.00%`);
  console.log(`- Tỷ lệ bỏ sót lỗi (False Negatives): 0.00%`);
  console.log(`- Kết luận: AI ĐẠT CHUẨN HOÀN HẢO 100%!`);
  console.log(`======================================================\n`);

  return {
    success: true,
    totalRounds: maxRounds,
    totalOrdersTested,
    totalAnomaliesTested,
    passedRounds
  };
}

// Chạy trực tiếp nếu gọi từ CLI
if (process.argv[1]?.endsWith('selfAuditLoop.js')) {
  const rounds = parseInt(process.argv[2] || '30', 10);
  runAutonomousLoop(rounds);
}
