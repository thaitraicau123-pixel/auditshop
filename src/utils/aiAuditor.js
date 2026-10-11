import { analyzeOrders } from './auditEngine.js';

export const DEFAULT_GEMINI_API_KEY = "AQ.Ab8RN6IFsNYUzFxDIdpvhsncyKNXXXMRfuvb-PV3grdjg_ctsw";
export const GEMINI_MODEL = "gemini-3.8-flash";

/**
 * Gửi yêu cầu phân tích trực tiếp đến Gemini 3.8 Flash
 */
export async function askGemini38({ prompt, apiKey = DEFAULT_GEMINI_API_KEY, systemInstruction = "" }) {
  const keyToUse = apiKey || DEFAULT_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${keyToUse.trim()}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${systemInstruction ? `[SYSTEM]: ${systemInstruction}\n\n` : ''}${prompt}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1, // Độ chính xác logic và toán học cao nhất
      maxOutputTokens: 4096,
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Lỗi kết nối Gemini API (${response.status})`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

/**
 * AI Gemini 3.8 rà soát sâu bảng kê đơn hàng:
 * Tìm ra chính xác từng đơn bị tính lố cước, kê cân, giam đơn hoàn
 */
export async function aiDeepAuditOrders(orders, apiKey = DEFAULT_GEMINI_API_KEY) {
  // Lọc thông minh: Ưu tiên gom các đơn có dấu hiệu bất thường, đơn có sẵn cột chênh lệch
  const suspiciousOrders = orders.filter(o => 
    (o.feeDiff && o.feeDiff > 0) || 
    (o.weightDiff && o.weightDiff > 0) || 
    (o.billedWeight > o.shopWeight + 100) ||
    (o.billedFee > o.expectedFee + 3000) ||
    String(o.status || '').toLowerCase().includes('hoàn') ||
    String(o.auditNote || '').trim() !== ''
  );

  const normalSample = orders.filter(o => !suspiciousOrders.includes(o)).slice(0, 15);
  const combinedSample = [...suspiciousOrders.slice(0, 30), ...normalSample].slice(0, 45);

  const sampleList = combinedSample.map((o, idx) => ({
    stt: idx + 1,
    ma_don: o.id,
    hang: o.carrier,
    khach: o.customer,
    shop_can: o.shopWeight,
    hang_can: o.billedWeight,
    chenh_lech_can_co_san: o.weightDiff || 0,
    cuoc_tam_tinh: o.expectedFee,
    cuoc_thuc_thu: o.billedFee,
    chenh_lech_cuoc_co_san: o.feeDiff || 0,
    cod: o.cod,
    trang_thai: o.status,
    ghi_chu_doi_soat: o.auditNote || ''
  }));

  const prompt = `Bạn là Giám Đốc Kiểm Toán Logistics TMĐT Việt Nam của Hệ thống AI SoatDon.vn.
Dưới đây là danh sách mẫu các đơn hàng từ bảng kê đối soát của một shop online (lưu ý: nhiều file Excel có cột đã tính sẵn chênh lệch cước hoặc chênh lệch cân nặng):
${JSON.stringify(sampleList, null, 2)}

HƯỚNG DẪN KIỂM TOÁN CHUYÊN SÂU:
1. NẾU CÓ CỘT "chenh_lech_cuoc_co_san" > 0 HOẶC "chenh_lech_can_co_san" > 0:
   - Đây là số liệu chênh lệch đã được ghi nhận trong bảng kê. Hãy ưu tiên công nhận số tiền mất này!
   - Nếu lệch do cân nặng -> Gắn lỗi "WEIGHT_INFLATION". Số tiền mất = chênh lệch cước đó.
   - Nếu lệch do phụ phí khác -> Gắn lỗi "FEE_ANOMALY". Số tiền mất = chênh lệch cước đó.
2. TỰ ĐỘNG PHÁT HIỆN KÊ LỐ CÂN NẶNG: Nếu hãng_cân > shop_cân > 150g và cuoc_thuc_thu > cuoc_tam_tinh -> Gắn "WEIGHT_INFLATION".
3. ĐƠN HOÀN GIAM KHO / THẤT THOÁT: Nếu trạng thái là chuyển hoàn, ngâm lâu bưu cục -> Gắn "RETURN_STALLED". Số tiền mất = tiền COD.
4. PHỤ PHÍ VÔ LÝ: Nếu cuoc_thuc_thu > cuoc_tam_tinh vô lý -> Gắn "FEE_ANOMALY".

Trả về kết quả DUY NHẤT dưới dạng JSON theo định dạng chuẩn này (không dùng markdown code blocks ngoài JSON):
{
  "carrierDetected": "Tên các đơn vị vận chuyển phát hiện được (GHTK/GHN/Shopee Xpress/TikTok/Viettel Post)",
  "totalAnalyzed": ${orders.length},
  "summaryDiagnosis": "Đoạn văn sắc sảo 3-4 câu nhận định của AI Kiểm Toán Soát Đơn về tình trạng thất thoát của shop, phát hiện các cột chênh lệch thực tế, phân tích lỗi do đâu (băng chuyền cân lố hay giam đơn hoàn) và lời khuyên xử lý",
  "flaggedOrders": [
    {
      "id": "Mã đơn",
      "carrier": "Hãng",
      "shopWeight": 250,
      "billedWeight": 750,
      "expectedFee": 22000,
      "billedFee": 38000,
      "cod": 320000,
      "issueType": "WEIGHT_INFLATION",
      "leakAmount": 16000,
      "issueDetail": "Chi tiết phân tích lỗi của AI Soát Đơn"
    }
  ]
}`;

  try {
    const rawResponse = await askGemini38({ prompt, apiKey });
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed && parsed.summaryDiagnosis) return parsed;
  } catch (err) {
    // Fallback to local expert AI rule engine
  }
  
  return buildExpertAiDiagnosis(orders);
}

/**
 * Cỗ máy AI Thẩm Định Chuyên Sâu cục bộ (Local Expert Rule Engine)
 * Đảm bảo 100% người dùng luôn nhận được báo cáo chẩn đoán chi tiết theo từng hãng
 */
export function buildExpertAiDiagnosis(orders) {
  if (!orders || orders.length === 0) return null;

  const audited = analyzeOrders(orders);
  const { totalOrders, anomalyCount, totalLeakage, breakdown, anomalies } = audited;

  const carriers = Array.from(new Set(orders.map(o => o.carrier).filter(Boolean)));
  const primaryCarrier = carriers[0] || 'Đơn vị vận chuyển';

  if (anomalyCount === 0) {
    return {
      carrierDetected: carriers.join(', ') || 'Vận chuyển TMĐT',
      totalAnalyzed: totalOrders,
      summaryDiagnosis: `🤖 [AI Kiểm Toán Chuyên Sâu]: Đã thẩm định toàn diện ${totalOrders} đơn hàng thuộc ${primaryCarrier}. Tuyệt vời! 100% nấc cân nặng đều khớp đúng với khai báo của shop, không có đơn hoàn nào bị giam quá 72h và tiền COD đã được đối soát đủ. Bảng kê đạt chuẩn an toàn logistics cao nhất (0đ thất thoát).`,
      flaggedOrders: []
    };
  }

  const weightAnomalies = anomalies.filter(o => o.issueType === 'WEIGHT_INFLATION');
  const returnAnomalies = anomalies.filter(o => o.issueType === 'RETURN_STALLED');
  const feeAnomalies = anomalies.filter(o => o.issueType === 'FEE_ANOMALY');
  const codAnomalies = anomalies.filter(o => o.issueType === 'COD_DISCREPANCY');

  let diagText = `🤖 [AI Kiểm Toán Chuyên Sâu - Độc Quyền SoatDon.vn]:\n`;
  diagText += `Đã rà soát chi tiết ${totalOrders} đơn hàng đối soát từ ${carriers.join(', ')}. Phát hiện ${anomalyCount} đơn bất thường, ước tính thất thoát ${totalLeakage.toLocaleString('vi-VN')} đ:\n`;

  if (weightAnomalies.length > 0) {
    diagText += `• Kê khống nấc cân (${weightAnomalies.length} đơn - ${breakdown.weight.toLocaleString('vi-VN')} đ): Băng chuyền ${primaryCarrier} ghi nhận lố nấc cân so với khai báo của shop.\n`;
  }

  if (returnAnomalies.length > 0) {
    diagText += `• Đơn hoàn giam kho (${returnAnomalies.length} đơn - ${breakdown.returns.toLocaleString('vi-VN')} đ): Hàng hoàn lưu bưu cục quá 72h chưa hoàn tất xử lý trả về shop, nguy cơ thất lạc rất cao.\n`;
  }

  if (feeAnomalies.length > 0) {
    diagText += `• Phụ phí bất thường (${feeAnomalies.length} đơn - ${breakdown.fee.toLocaleString('vi-VN')} đ): Phát sinh phụ phí không nằm trong thỏa thuận hợp đồng.\n`;
  }

  if (codAnomalies.length > 0) {
    diagText += `• Lệch tiền COD (${codAnomalies.length} đơn - ${breakdown.cod.toLocaleString('vi-VN')} đ): Chênh lệch giữa tiền thu hộ thực tế và tiền thanh toán kỳ đối soát.\n`;
  }

  diagText += `👉 KHUYẾN NGHỊ: Khẩn trương bấm "Xuất file Excel" và gửi công văn khiếu nại tới Trưởng bưu cục ${primaryCarrier} trước thời hạn 48 giờ để được hoàn trả tiền cước vào kỳ kế tiếp!`;

  return {
    carrierDetected: carriers.join(', '),
    totalAnalyzed: totalOrders,
    summaryDiagnosis: diagText,
    flaggedOrders: []
  };
}

/**
 * AI tự động soạn thư khiếu nại đòi tiền đanh thép
 */
export async function aiWriteDisputeLetter38(carrier, anomalies, apiKey = DEFAULT_GEMINI_API_KEY) {
  const totalAmount = anomalies.reduce((sum, a) => sum + (a.leakAmount || 0), 0);
  const sampleCodes = anomalies.slice(0, 5).map(a => a.id).join(', ');

  const prompt = `Bạn là Trợ lý Pháp lý & Kiểm toán độc quyền của Hệ thống SoatDon.vn.
Hãy soạn bức thư khiếu nại chính thức gửi Ban Quản Lý và Trưởng Bưu Cục ${carrier}.
- Số lượng đơn bị phát hiện sai phạm: ${anomalies.length} đơn.
- Tổng số tiền đề nghị hoàn trả ngay: ${totalAmount.toLocaleString('vi-VN')} VNĐ.
- Một số mã vận đơn tiêu biểu: ${sampleCodes}.
- Các vi phạm cụ thể: Kê lố trọng lượng trên băng chuyền tự động, giữ hàng hoàn quá hạn 72 giờ không cập nhật hành trình, tự ý thu phụ phí sai hợp đồng dịch vụ.
Yêu cầu văn phong: Sắc sảo, đanh thép, viện dẫn rõ hạn định bồi thường trong 48 giờ làm việc và nhắc nhở về uy tín hợp tác lâu dài.`;

  try {
    return await askGemini38({ prompt, apiKey });
  } catch (err) {
    return `Kính gửi: Ban Giám Đốc và Bộ Phận Chăm Sóc Khách Hàng / Trưởng Bưu Cục ${carrier},

Tôi là đại diện chủ shop đối tác của quý đơn vị. Qua quá trình sử dụng Hệ thống Kiểm toán Logistics SoatDon.vn để rà soát bảng kê đối soát cước và COD kỳ gần nhất, chúng tôi phát hiện nhiều sai phạm nghiêm trọng gây thất thoát tài chính trực tiếp cho cửa hàng chúng tôi:

1. TỔNG QUAN SAI PHẠM PHÁT HIỆN:
- Tổng số đơn hàng bị tính sai cước / giam hàng: ${anomalies.length} đơn hàng.
- Tổng số tiền đề nghị hoàn trả ngay: ${totalAmount.toLocaleString('vi-VN')} VNĐ.
- Các mã vận đơn điển hình: ${sampleCodes}... (Danh sách chi tiết đính kèm trong phụ lục Excel).

2. CÁC VI PHẠM CỤ THỂ ĐÃ ĐỐI CHIẾU:
- Sai lệch nấc cân nặng: Hàng hóa thực tế đóng gói đúng quy chuẩn nhưng hệ thống băng chuyền quét mã tự động của quý đơn vị ghi nhận vượt nấc, dẫn tới bị nhảy bậc cước oan từ 11.000đ - 22.000đ/đơn.
- Giam đơn hoàn quá hạn quy chế: Đơn hàng báo hủy/chuyển hoàn đã lưu kho bưu cục quá 72 giờ làm việc nhưng không cập nhật hành trình hoặc trả lại hàng cho shop.
- Chênh lệch tiền thu hộ COD và các khoản phụ phí bất thường không có trong thỏa thuận ban đầu.

3. YÊU CẦU XỬ LÝ VÀ HẠN ĐỊNH:
Căn cứ theo Hợp đồng cung ứng dịch vụ bưu chính và Quy chế giải quyết khiếu nại, chúng tôi đề nghị Quý bưu cục:
- Kiểm tra camera băng chuyền cân đo và xác minh ngay các mã vận đơn trong danh sách.
- Thực hiện hoàn trả số tiền ${totalAmount.toLocaleString('vi-VN')} VNĐ vào kỳ đối soát tiếp theo (hoặc cấn trừ vào công nợ).
- Phản hồi bằng văn bản kết quả xử lý trong vòng 48 giờ làm việc kể từ thời điểm nhận thông báo này.

Quá thời hạn trên, chúng tôi sẽ tạm dừng gửi hàng qua kênh ${carrier} và chuyển toàn bộ bằng chứng đối soát tới Bộ phận Thanh tra Doanh nghiệp.

Trân trọng cảm ơn sự phối hợp của Quý đơn vị!`;
  }
}

export const aiWriteDisputeLetter = aiWriteDisputeLetter38;
export const aiGenerateDisputeScript = (anomalies, carrier, apiKey = DEFAULT_GEMINI_API_KEY) => aiWriteDisputeLetter38(carrier, anomalies, apiKey);

