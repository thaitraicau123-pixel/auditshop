/**
 * Cross-Reconciliation Engine (So khớp 2 File 2 Chiều: File Shop vs File Bưu Cục)
 * Hỗ trợ các phần mềm quản lý bán hàng: KiotViet, Sapo, Pancake, Haravan, PosCake, Nhanh.vn, v.v.
 */
import * as XLSX from 'xlsx';

// Chuẩn hóa mã vận đơn (bỏ khoảng trắng, chuyển chữ hoa, lọc ký tự thừa)
export function normalizeTrackingCode(code) {
  if (!code) return '';
  return String(code).trim().toUpperCase().replace(/[\s\-_]/g, '');
}

// Chuẩn hóa số tiền
export function parseCurrency(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Chuẩn hóa cân nặng (gram)
export function parseWeightInGram(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') {
    // Nếu < 30 coi như là kg (vd: 0.5kg = 500g, 1.2kg = 1200g)
    return val < 30 ? Math.round(val * 1000) : Math.round(val);
  }
  const str = String(val).toLowerCase().trim();
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  if (str.includes('kg') || num < 30) {
    return Math.round(num * 1000);
  }
  return Math.round(num);
}

// Nhận diện cột tự động từ header hàng đầu
export function detectColumnMapping(headers) {
  const map = {
    tracking: -1,
    weight: -1,
    cod: -1,
    fee: -1,
    status: -1,
    customer: -1,
    product: -1,
    date: -1
  };

  headers.forEach((h, idx) => {
    if (!h) return;
    const text = String(h).toLowerCase();

    // Mã vận đơn
    if (
      (text.includes('mã') && (text.includes('vận đơn') || text.includes('đơn') || text.includes('tracking') || text.includes('phiếu gửi') || text.includes('bưu gửi'))) ||
      text === 'tracking' || text === 'waybill' || text === 'mã bill' || text === 'mã đơn'
    ) {
      if (map.tracking === -1) map.tracking = idx;
    }

    // Cân nặng
    else if (text.includes('trọng lượng') || text.includes('khối lượng') || text.includes('cân nặng') || text.includes('weight') || text.includes('gram') || text.includes('kg')) {
      if (map.weight === -1) map.weight = idx;
    }

    // Tiền thu hộ COD
    else if (text.includes('cod') || text.includes('thu hộ') || text.includes('tiền thu') || text.includes('tiền hàng') || text.includes('khách trả')) {
      if (map.cod === -1) map.cod = idx;
    }

    // Cước vận chuyển
    else if (text.includes('cước') || text.includes('phí ship') || text.includes('phí vận chuyển') || text.includes('tổng phí') || text.includes('fee')) {
      if (map.fee === -1) map.fee = idx;
    }

    // Trạng thái
    else if (text.includes('trạng thái') || text.includes('status') || text.includes('kết quả') || text.includes('tình trạng')) {
      if (map.status === -1) map.status = idx;
    }

    // Khách hàng / Địa chỉ
    else if (text.includes('khách') || text.includes('người nhận') || text.includes('địa chỉ') || text.includes('customer')) {
      if (map.customer === -1) map.customer = idx;
    }

    // Sản phẩm
    else if (text.includes('sản phẩm') || text.includes('hàng hóa') || text.includes('tên hàng') || text.includes('product')) {
      if (map.product === -1) map.product = idx;
    }

    // Ngày tạo / gửi
    else if (text.includes('ngày') || text.includes('thời gian') || text.includes('date') || text.includes('time')) {
      if (map.date === -1) map.date = idx;
    }
  });

  return map;
}

// Phân tích dữ liệu bảng tính thành danh sách bản ghi chuẩn hóa
export function parseSheetToRecords(sheetData, type = 'shop') {
  if (!sheetData || sheetData.length < 2) return [];

  // Tìm hàng header (hàng đầu tiên có ít nhất 2 cột có chữ)
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(sheetData.length, 10); i++) {
    const row = sheetData[i] || [];
    const textCols = row.filter(cell => cell && typeof cell === 'string' && cell.trim().length > 1);
    if (textCols.length >= 2) {
      headerRowIdx = i;
      break;
    }
  }

  const headers = sheetData[headerRowIdx] || [];
  const colMap = detectColumnMapping(headers);

  // Nếu không tìm thấy mã vận đơn thì mặc định lấy cột đầu tiên có giá trị giống mã
  if (colMap.tracking === -1) {
    colMap.tracking = 0;
  }

  const records = [];
  for (let r = headerRowIdx + 1; r < sheetData.length; r++) {
    const row = sheetData[r] || [];
    const rawCode = row[colMap.tracking];
    if (!rawCode) continue;

    const trackingCode = normalizeTrackingCode(rawCode);
    if (!trackingCode || trackingCode.length < 3) continue;

    const weight = colMap.weight !== -1 ? parseWeightInGram(row[colMap.weight]) : 0;
    const cod = colMap.cod !== -1 ? parseCurrency(row[colMap.cod]) : 0;
    const fee = colMap.fee !== -1 ? parseCurrency(row[colMap.fee]) : 0;
    const status = colMap.status !== -1 ? String(row[colMap.status] || '').trim() : '';
    const customer = colMap.customer !== -1 ? String(row[colMap.customer] || '').trim() : '';
    const product = colMap.product !== -1 ? String(row[colMap.product] || '').trim() : '';
    const date = colMap.date !== -1 ? String(row[colMap.date] || '').trim() : '';

    records.push({
      rowIndex: r + 1,
      trackingCode,
      originalCode: String(rawCode).trim(),
      weight,
      cod,
      fee,
      status,
      customer,
      product,
      date,
      type
    });
  }

  return records;
}

/**
 * Thuật toán so khớp 2 chiều (Cross-Reconciliation 2-Way Match)
 * @param {Array} shopRecords - Dữ liệu xuất kho từ phần mềm quản lý bán hàng của shop
 * @param {Array} carrierRecords - Dữ liệu bảng kê đối soát từ bưu cục
 */
export function reconcileShopVsCarrier(shopRecords, carrierRecords) {
  const carrierMap = new Map();
  carrierRecords.forEach(c => {
    carrierMap.set(c.trackingCode, c);
  });

  const shopMap = new Map();
  shopRecords.forEach(s => {
    shopMap.set(s.trackingCode, s);
  });

  const results = {
    totalShopOrders: shopRecords.length,
    totalCarrierOrders: carrierRecords.length,
    matchedCount: 0,
    anomalies: [],
    summary: {
      weightDiscrepancyCount: 0,
      weightDiscrepancyLoss: 0,
      codDiscrepancyCount: 0,
      codDiscrepancyLoss: 0,
      missingInCarrierCount: 0,
      missingInCarrierLoss: 0,
      missingInShopCount: 0,
      returnPendingCount: 0,
      totalLoss: 0
    }
  };

  // 1. Kiểm tra từng đơn của Shop đối chiếu với Bưu Cục
  shopRecords.forEach(shopOrder => {
    const carrierOrder = carrierMap.get(shopOrder.trackingCode);

    if (!carrierOrder) {
      // LỖI 1: Shop đã gửi hàng nhưng bưu cục KHÔNG CÓ trong bảng kê đối soát
      const estimatedLoss = shopOrder.cod > 0 ? shopOrder.cod : 50000;
      results.summary.missingInCarrierCount++;
      results.summary.missingInCarrierLoss += estimatedLoss;
      results.summary.totalLoss += estimatedLoss;

      results.anomalies.push({
        id: `ANOMALY_MISSCAR_${shopOrder.trackingCode}`,
        trackingCode: shopOrder.trackingCode,
        issueType: 'MISSING_IN_CARRIER',
        issueTitle: 'Bưu cục chưa đối soát / Thất lạc đơn',
        severity: 'CRITICAL',
        shopData: {
          weight: shopOrder.weight,
          cod: shopOrder.cod,
          customer: shopOrder.customer,
          row: shopOrder.rowIndex
        },
        carrierData: null,
        discrepancy: `Shop cài COD ${shopOrder.cod.toLocaleString('vi-VN')} đ nhưng bưu cục chưa thanh toán trong kỳ này`,
        leakAmount: estimatedLoss,
        actionRecommendation: 'Yêu cầu bưu cục tra soát ngay trạng thái phát hoặc đền bù giá trị COD thất lạc.'
      });
      return;
    }

    results.matchedCount++;

    // LỖI 2: Lệch nấc cân nặng (Bưu cục cân nặng hơn shop >= 200g)
    if (carrierOrder.weight > 0 && shopOrder.weight > 0) {
      const weightDiff = carrierOrder.weight - shopOrder.weight;
      if (weightDiff >= 200) {
        // Ước tính cước đội thêm: Khoảng 5.000đ - 12.000đ/mỗi 500g vượt nấc
        const steps = Math.ceil(weightDiff / 500);
        const estimatedWeightLoss = Math.max(steps * 6000, 5000);

        results.summary.weightDiscrepancyCount++;
        results.summary.weightDiscrepancyLoss += estimatedWeightLoss;
        results.summary.totalLoss += estimatedWeightLoss;

        results.anomalies.push({
          id: `ANOMALY_WEIGHT_${shopOrder.trackingCode}`,
          trackingCode: shopOrder.trackingCode,
          issueType: 'DISCREPANCY_WEIGHT',
          issueTitle: 'Bưu cục đội nấc cân nặng',
          severity: 'HIGH',
          shopData: {
            weight: shopOrder.weight,
            cod: shopOrder.cod,
            customer: shopOrder.customer,
            row: shopOrder.rowIndex
          },
          carrierData: {
            weight: carrierOrder.weight,
            cod: carrierOrder.cod,
            fee: carrierOrder.fee,
            row: carrierOrder.rowIndex
          },
          discrepancy: `Kho shop đóng ${shopOrder.weight}g nhưng bưu cục tính ${carrierOrder.weight}g (Đội +${weightDiff}g)`,
          leakAmount: estimatedWeightLoss,
          actionRecommendation: `Khiếu nại hạ nấc cước về ${shopOrder.weight}g, đòi hoàn lại ${estimatedWeightLoss.toLocaleString('vi-VN')} đ.`
        });
      }
    }

    // LỖI 3: Lệch tiền COD thu hộ (Bưu cục trả ít hơn tiền shop cài đặt)
    if (shopOrder.cod > 0) {
      const codDiff = shopOrder.cod - (carrierOrder.cod || 0);
      if (codDiff > 1000) {
        results.summary.codDiscrepancyCount++;
        results.summary.codDiscrepancyLoss += codDiff;
        results.summary.totalLoss += codDiff;

        results.anomalies.push({
          id: `ANOMALY_COD_${shopOrder.trackingCode}`,
          trackingCode: shopOrder.trackingCode,
          issueType: 'DISCREPANCY_COD',
          issueTitle: 'Bưu cục chuyển thiếu tiền COD',
          severity: 'CRITICAL',
          shopData: {
            weight: shopOrder.weight,
            cod: shopOrder.cod,
            customer: shopOrder.customer,
            row: shopOrder.rowIndex
          },
          carrierData: {
            weight: carrierOrder.weight,
            cod: carrierOrder.cod,
            fee: carrierOrder.fee,
            row: carrierOrder.rowIndex
          },
          discrepancy: `Shop yêu cầu thu ${shopOrder.cod.toLocaleString('vi-VN')} đ, bưu cục chỉ trả ${(carrierOrder.cod || 0).toLocaleString('vi-VN')} đ (Thiếu -${codDiff.toLocaleString('vi-VN')} đ)`,
          leakAmount: codDiff,
          actionRecommendation: `Gửi đối chiếu ảnh bill đơn hàng, yêu cầu quyết toán bổ sung ${codDiff.toLocaleString('vi-VN')} đ.`
        });
      }
    }

    // LỖI 4: Đơn chuyển hoàn bưu cục báo xong nhưng shop chưa xác nhận nhận
    const carrierStatus = (carrierOrder.status || '').toLowerCase();
    const shopStatus = (shopOrder.status || '').toLowerCase();
    if (
      (carrierStatus.includes('hoàn') || carrierStatus.includes('trả hàng') || carrierStatus.includes('return')) &&
      !shopStatus.includes('nhận hoàn') && !shopStatus.includes('đã nhập')
    ) {
      results.summary.returnPendingCount++;
      results.anomalies.push({
        id: `ANOMALY_RET_${shopOrder.trackingCode}`,
        trackingCode: shopOrder.trackingCode,
        issueType: 'RETURN_PENDING',
        issueTitle: 'Bưu cục báo hoàn nhưng kho chưa nhận hàng',
        severity: 'MEDIUM',
        shopData: {
          weight: shopOrder.weight,
          cod: shopOrder.cod,
          customer: shopOrder.customer,
          row: shopOrder.rowIndex
        },
        carrierData: {
          status: carrierOrder.status,
          row: carrierOrder.rowIndex
        },
        discrepancy: `Bưu cục đánh dấu "${carrierOrder.status}" nhưng kho shop chưa quét nhận kiện hàng hoàn về`,
        leakAmount: 0,
        actionRecommendation: 'Yêu cầu shipper giao ngay kiện hàng hoàn hoặc lập biên bản bồi thường nếu làm mất kiện hàng.'
      });
    }
  });

  // 2. Kiểm tra những đơn Bưu Cục tính cước nhưng KHÔNG CÓ trong danh sách Shop xuất kho
  carrierRecords.forEach(carrierOrder => {
    const shopOrder = shopMap.get(carrierOrder.trackingCode);
    if (!shopOrder) {
      results.summary.missingInShopCount++;
      const feeLoss = carrierOrder.fee > 0 ? carrierOrder.fee : 25000;
      results.summary.totalLoss += feeLoss;

      results.anomalies.push({
        id: `ANOMALY_MISSSHOP_${carrierOrder.trackingCode}`,
        trackingCode: carrierOrder.trackingCode,
        issueType: 'MISSING_IN_SHOP',
        issueTitle: 'Tính cước nhầm đơn của shop khác',
        severity: 'HIGH',
        shopData: null,
        carrierData: {
          weight: carrierOrder.weight,
          cod: carrierOrder.cod,
          fee: carrierOrder.fee,
          row: carrierOrder.rowIndex
        },
        discrepancy: `Bưu cục trừ cước ${carrierOrder.fee.toLocaleString('vi-VN')} đ nhưng mã vận đơn này không tồn tại trong kho shop`,
        leakAmount: feeLoss,
        actionRecommendation: `Yêu cầu bưu cục hủy trừ cước đơn ${carrierOrder.trackingCode} do gán nhầm mã khách hàng.`
      });
    }
  });

  return results;
}

/**
 * Sinh bộ dữ liệu 2 File Demo chuẩn thực tế (Shop File vs Carrier File)
 * để người dùng bấm nút test thử nghiệm 1-chạm mà không cần upload file thật!
 */
export function generateDemoCrossReconcileDatasets() {
  const commonCodes = [
    { code: 'GHTK8829104', cust: 'Nguyễn Thùy Linh (Hà Nội)', shopW: 280, carW: 1250, shopCod: 320000, carCod: 320000, fee: 42000 }, // Đội cân
    { code: 'GHTK8829105', cust: 'Trần Văn Mạnh (TP.HCM)', shopW: 350, carW: 360, shopCod: 480000, carCod: 350000, fee: 26000 }, // Thiếu COD
    { code: 'GHN9920141', cust: 'Lê Hoàng Yến (Đà Nẵng)', shopW: 180, carW: 850, shopCod: 210000, carCod: 210000, fee: 35000 }, // Đội cân
    { code: 'VTP4401928', cust: 'Phạm Minh Tuấn (Hải Phòng)', shopW: 420, carW: 430, shopCod: 550000, carCod: 550000, fee: 28000 }, // Khớp chuẩn
    { code: 'SPX7718290', cust: 'Vũ Thị Hằng (Cần Thơ)', shopW: 300, carW: 310, shopCod: 390000, carCod: 390000, fee: 22000 }, // Khớp chuẩn
    { code: 'JT5510291', cust: 'Đặng Quốc Bảo (Nghệ An)', shopW: 250, carW: 1100, shopCod: 180000, carCod: 180000, fee: 38000 }, // Đội cân
    { code: 'TTS6601922', cust: 'Bùi Lan Chi (Bình Dương)', shopW: 500, carW: 510, shopCod: 620000, carCod: 450000, fee: 30000 }, // Thiếu COD
    { code: 'GHTK8829109', cust: 'Hoàng Kim Ngân (Quảng Ninh)', shopW: 220, carW: 230, shopCod: 290000, carCod: 0, fee: 26000 }, // Quên trả COD
  ];

  // File Shop (Có thêm đơn bưu cục chưa đối soát)
  const shopData = [
    ['Mã Đơn Hàng (Shop)', 'Tên Khách Hàng', 'Khối Lượng Kho (g)', 'Tiền Thu Hộ COD (đ)', 'Trạng Thái Xuất Kho', 'Ngày Xuất']
  ];

  commonCodes.forEach(c => {
    shopData.push([c.code, c.cust, c.shopW, c.shopCod, 'Đã bàn giao shipper', '10/10/2026']);
  });

  // Đơn chỉ có ở Shop, bưu cục chưa kê
  shopData.push(['GHTK8829999_LOST', 'Đỗ Thành Nam (Thanh Hóa)', 400, 750000, 'Đã gửi bưu tá', '08/10/2026']);
  shopData.push(['GHN9920888_LOST', 'Ngô Thu Trang (Bắc Ninh)', 310, 420000, 'Đã gửi bưu tá', '09/10/2026']);

  // File Bưu Cục (Có thêm đơn lạ gán nhầm vào shop)
  const carrierData = [
    ['Mã Phiếu Gửi', 'Người Nhận', 'Khối Lượng Tính Cước (g)', 'Tiền COD Thực Trả (đ)', 'Cước Phí Trừ (đ)', 'Trạng Thái Giao Hàng']
  ];

  commonCodes.forEach(c => {
    carrierData.push([c.code, c.cust, c.carW, c.carCod, c.fee, 'Giao hàng thành công']);
  });

  // Đơn lạ bưu cục gán nhầm vào bảng kê của shop
  carrierData.push(['GHTK8827777_STRANGER', 'Người lạ shop khác (Hà Nội)', 850, 0, 48000, 'Giao thành công']);
  carrierData.push(['VTP4406666_STRANGER', 'Người lạ shop khác (HCM)', 1200, 0, 52000, 'Giao thành công']);

  return { shopData, carrierData };
}

/**
 * Xuất file Excel Báo Cáo Đối Soát 2 Chiều (.xlsx)
 */
export function exportCrossReconcileExcel(results, filename = 'Bien_Ban_Doi_Chieu_2_File_Shop_vs_Buu_Cuc.xlsx') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Tổng Hợp Chênh Lệch
  const summaryRows = [
    ['BÁO CÁO ĐỐI SOÁT 2 CHIỀU: FILE KHO SHOP VS FILE BẢNG KÊ BƯU CỤC'],
    ['Ngày tạo biên bản:', new Date().toLocaleString('vi-VN')],
    ['Hệ thống kiểm toán:', 'SoatDon.vn (AuditShop Enterprise)'],
    [''],
    ['CHỈ SỐ TỔNG HỢP', 'GIÁ TRỊ'],
    ['Tổng đơn xuất kho Shop:', results.totalShopOrders],
    ['Tổng đơn bưu cục kê cước:', results.totalCarrierOrders],
    ['Số đơn khớp mã thành công:', results.matchedCount],
    ['Tổng số đơn dính sai lệch:', results.anomalies.length],
    ['TỔNG TIỀN THẤT THOÁT PHÁT HIỆN:', `${results.summary.totalLoss.toLocaleString('vi-VN')} đ`],
    [''],
    ['CHI TIẾT DẠNG SAI LỆCH', 'SỐ ĐƠN', 'TIỀN THẤT THOÁT'],
    ['1. Đơn Shop gửi nhưng bưu cục chưa đối soát / thất lạc:', results.summary.missingInCarrierCount, `${results.summary.missingInCarrierLoss.toLocaleString('vi-VN')} đ`],
    ['2. Bưu cục đội khống nấc cân nặng so với kho shop:', results.summary.weightDiscrepancyCount, `${results.summary.weightDiscrepancyLoss.toLocaleString('vi-VN')} đ`],
    ['3. Bưu cục chuyển thiếu tiền COD thu hộ:', results.summary.codDiscrepancyCount, `${results.summary.codDiscrepancyLoss.toLocaleString('vi-VN')} đ`],
    ['4. Bưu cục tính cước nhầm đơn của shop khác:', results.summary.missingInShopCount, `${(results.summary.missingInShopCount * 25000).toLocaleString('vi-VN')} đ`],
    ['5. Bưu cục báo hoàn nhưng kho shop chưa nhận hàng:', results.summary.returnPendingCount, 'Cần truy vết bưu kiện']
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Hợp Tổn Thất');

  // Sheet 2: Danh Sách Đơn Cần Khiếu Nại Đòi Tiền
  const detailHeaders = [
    ['STT', 'Mã Vận Đơn', 'Phân Loại Lỗi', 'Mức Độ', 'Cân Kho Shop (g)', 'Cân Bưu Cục (g)', 'COD Shop Cài (đ)', 'COD Bưu Cục Trả (đ)', 'Tiền Thiệt Hại (đ)', 'Bản Chất Lệch', 'Biện Pháp Yêu Cầu']
  ];

  const detailRows = results.anomalies.map((ano, idx) => [
    idx + 1,
    ano.trackingCode,
    ano.issueTitle,
    ano.severity,
    ano.shopData?.weight || 0,
    ano.carrierData?.weight || 0,
    ano.shopData?.cod || 0,
    ano.carrierData?.cod || 0,
    ano.leakAmount,
    ano.discrepancy,
    ano.actionRecommendation
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([...detailHeaders, ...detailRows]);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi Tiết Đơn Khiếu Nại');

  XLSX.writeFile(wb, filename);
}
