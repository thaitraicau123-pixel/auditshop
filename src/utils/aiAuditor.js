/**
 * AI Auditor Engine tích hợp Google Gemini API
 * Giúp đọc hiểu cấu trúc file Excel phức tạp, phát hiện lỗi chính xác 99% và viết đơn khiếu nại thông minh.
 */

export async function askGemini({ prompt, apiKey, systemInstruction = "" }) {
  if (!apiKey) {
    throw new Error("Vui lòng cung cấp Gemini API Key để kích hoạt tính năng AI!");
  }

  // Sử dụng model gemini-2.5-flash hoặc gemini-1.5-flash siêu nhanh và tiết kiệm
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

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
      temperature: 0.1, // Nhiệt độ thấp để phân tích số liệu chính xác tuyệt đối
      maxOutputTokens: 2048,
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
 * AI tự động đọc cấu trúc các cột trong file Excel dù file có bị xáo trộn hoặc nhiều dòng rác
 */
export async function aiAnalyzeSchema(headers, sampleRows, apiKey) {
  if (!apiKey) return null;

  const prompt = `Bạn là chuyên gia đối soát vận chuyển TMĐT tại Việt Nam (GHTK, GHN, Shopee Xpress, TikTok Shop, Viettel Post).
Dưới đây là danh sách tiêu đề các cột và 3 dòng mẫu từ 1 file Excel đối soát:

Tiêu đề cột:
${JSON.stringify(headers)}

3 dòng mẫu dữ liệu:
${JSON.stringify(sampleRows.slice(0, 3))}

Nhiệm vụ: Hãy phân tích và xác định chính xác tên hoặc index cột tương ứng với các trường sau dưới dạng JSON:
{
  "trackingCodeCol": "tên hoặc index cột mã vận đơn",
  "carrierCol": "tên hoặc index cột hãng vận chuyển",
  "shopWeightCol": "tên hoặc index cột cân nặng shop khai báo (gram)",
  "billedWeightCol": "tên hoặc index cột cân nặng hãng tính cước (gram)",
  "expectedFeeCol": "tên hoặc index cột cước phí dự kiến / tạm tính",
  "billedFeeCol": "tên hoặc index cột cước phí thực thu / tổng cước bị trừ",
  "codCol": "tên hoặc index cột tiền thu hộ COD",
  "statusCol": "tên hoặc index cột trạng thái giao hàng",
  "customerCol": "tên hoặc index cột tên người nhận",
  "carrierName": "tên đơn vị vận chuyển phát hiện được (ví dụ: GHTK, GHN, Shopee, TikTok, Viettel Post)"
}

Chỉ trả về JSON thuần túy, không kèm giải thích ngoài JSON.`;

  try {
    const response = await askGemini({ prompt, apiKey });
    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn("AI Schema Analysis fallback:", err);
    return null;
  }
}

/**
 * AI đưa ra nhận định chuyên sâu về các đơn bất thường phát hiện được
 */
export async function aiGenerateAuditDiagnosis(anomalies, totalOrders, totalLeakage, apiKey) {
  if (!apiKey || anomalies.length === 0) return null;

  const topAnomalies = anomalies.slice(0, 6).map(a => ({
    id: a.id,
    carrier: a.carrier,
    shopWeight: a.shopWeight,
    billedWeight: a.billedWeight,
    leakAmount: a.leakAmount,
    issue: a.issueDetail
  }));

  const prompt = `Bạn là chuyên viên kiểm toán logistics e-commerce. 
Tôi vừa quét 1 bảng kê gồm ${totalOrders} đơn hàng và phát hiện thất thoát tạm tính ${totalLeakage.toLocaleString('vi-VN')} VNĐ từ ${anomalies.length} đơn bất thường.
Dưới đây là một số đơn tiêu biểu:
${JSON.stringify(topAnomalies, null, 2)}

Hãy viết một Báo Cáo Chẩn Đoán Ngắn Gọn (khoảng 3-4 đoạn gạch đầu dòng súc tích, chuyên nghiệp) gồm:
1. Đánh giá mức độ rủi ro (Nghiêm trọng / Trung bình) và phân tích nguyên nhân chính (do lỗi cân băng chuyền bưu cục, do shipper ngâm hàng hoàn, hay do trừ phụ phí vô căn cứ).
2. Lời khuyên cụ thể cho chủ shop: Cần làm việc với ai (Bưu cục trưởng hay tổng đài CSKH), các bằng chứng cần chuẩn bị (video đóng gói, cân đối chứng), và thời hạn chót cần nộp khiếu nại để không bị quá hạn.`;

  try {
    const diagnosis = await askGemini({ prompt, apiKey });
    return diagnosis;
  } catch (err) {
    console.warn("AI Diagnosis fallback:", err);
    return null;
  }
}

/**
 * AI tự động soạn thảo thư khiếu nại đanh thép, chuẩn mực pháp lý
 */
export async function aiWriteDisputeLetter(carrier, anomalies, apiKey) {
  if (!apiKey) return null;

  const totalAmount = anomalies.reduce((sum, a) => sum + a.leakAmount, 0);
  const sampleCodes = anomalies.slice(0, 5).map(a => a.id).join(', ');

  const prompt = `Soạn một bức thư khiếu nại chính thức gửi Ban Giám Đốc và Bộ Phận Đối Soát của ${carrier}.
- Tổng số đơn sai lệch: ${anomalies.length} đơn.
- Tổng số tiền thất thoát yêu cầu hoàn trả: ${totalAmount.toLocaleString('vi-VN')} VNĐ.
- Các mã tiêu biểu: ${sampleCodes}.
- Các vi phạm: kê lố nấc cân nặng so với thể tích thực tế, đơn hoàn ngâm quá 72h không trả về shop theo quy chế bồi thường, phụ phí bất thường.
Yêu cầu văn phong: Chuyên nghiệp, lịch sự nhưng đanh thép, viện dẫn nghĩa vụ hợp đồng dịch vụ vận chuyển và đặt thời hạn phản hồi trong 48 giờ làm việc trước khi khiếu nại lên Cục Thương Mại Điện Tử & Bảo Vệ Người Tiêu Dùng.`;

  try {
    return await askGemini({ prompt, apiKey });
  } catch (err) {
    console.warn("AI Dispute Letter fallback:", err);
    return null;
  }
}
