import * as XLSX from 'xlsx';

/**
 * Xuất file Excel khiếu nại chính thức để nộp bưu cục / CSKH
 */
export function exportDisputeExcel(anomalies, shopName = "Shop Online") {
  const exportData = anomalies.map((item, idx) => ({
    "STT": idx + 1,
    "Mã Vận Đơn": item.id,
    "Hãng Vận Chuyển": item.carrier,
    "Lỗi Phát Hiện": 
      item.issueType === "WEIGHT_INFLATION" ? "Kê khống trọng lượng tính cước" :
      item.issueType === "RETURN_STALLED" ? "Đơn hoàn quá hạn / Chưa nhận hàng hoàn" :
      item.issueType === "FEE_ANOMALY" ? "Phụ phí phát sinh bất thường" :
      item.issueType === "COD_DISCREPANCY" ? "Lệch tiền COD đối soát" : "Khác",
    "Số Tiền Đề Nghị Hoàn (VNĐ)": item.leakAmount,
    "Trọng Lượng Shop Khai Báo (g)": item.shopWeight,
    "Trọng Lượng Bị Tính Cước (g)": item.billedWeight,
    "Cước Dự Kiến (VNĐ)": item.expectedFee,
    "Cước Thực Bị Trừ (VNĐ)": item.billedFee,
    "Tiền COD (VNĐ)": item.cod,
    "Chi Tiết Khiếu Nại & Căn Cứ": item.issueDetail,
    "Yêu Cầu Giải Quyết": 
      item.issueType === "WEIGHT_INFLATION" ? "Yêu cầu cân lại tại kho / Hoàn trả phần chênh lệch cước vào kỳ đối soát tới" :
      item.issueType === "RETURN_STALLED" ? "Yêu cầu trả hàng ngay trong 24h hoặc lập biên bản bồi thường 100% giá trị kiện hàng" :
      "Yêu cầu hoàn trả khoản phụ phí thu sai quy định hợp đồng"
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Don_Khieu_Nai_Hoan_Tien");
  
  const fileName = `Bang_Ke_Khieu_Nai_Doi_Tien_${shopName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Bộ mẫu khiếu nại chuyên nghiệp cho từng đơn vị vận chuyển
 */
export const DISPUTE_TEMPLATES = {
  GHTK: `Kính gửi Bộ phận Đối soát & CSKH Giao Hàng Tiết Kiệm (GHTK),

Shop tôi gửi yêu cầu kiểm tra và hoàn trả cước chênh lệch cho danh sách đơn hàng đối soát kỳ này:
1. Vấn đề kê khống trọng lượng: Nhiều đơn hàng bị cân tự động nhảy nấc cước gấp 2-3 lần so với trọng lượng đóng gói thực tế của shop. Đề nghị kiểm tra trích xuất camera băng chuyền cân đo và hoàn lại phần cước chênh lệch.
2. Vấn đề hàng hoàn quá hạn: Các đơn hoàn quá 72h không cập nhật trạng thái hoặc bưu cục không giao trả, đề nghị xử lý bồi thường 100% giá trị hàng hóa theo cam kết dịch vụ.

Đề nghị GHTK rà soát và phản hồi bằng văn bản/kết quả điều chỉnh trong vòng 48 giờ làm việc.
Chi tiết danh sách mã vận đơn vui lòng xem file Excel đính kèm.

Trân trọng!`,

  GHN: `Kính gửi Ban Quản Lý Bưu Cục & Bộ Phận Đối Soát Giao Hàng Nhanh (GHN),

Qua đối chiếu số liệu bảng kê vận hành kỳ vừa qua, Shop ghi nhận nhiều bất thường cần GHN phối hợp xử lý khẩn cấp:
- Lệch thể tích/cân nặng quy đổi: Các đơn hàng bị tính phụ phí vượt cân vô lý so với kích thước gói hàng tiêu chuẩn của shop.
- Chậm trễ hoàn hàng / thất lạc: Các đơn lưu kho hoàn quá hạn quy định chưa được giao trả lại shop.

Đề nghị Quý công ty kiểm tra lại lịch sử cân đo tự động tại kho phân loại và đối soát hoàn trả cước thừa cho shop vào kỳ thanh toán tiếp theo. Danh sách mã đơn chi tiết đính kèm.

Trân trọng!`,

  "Viettel Post": `Kính gửi Ban Giám Đốc Chi Nhánh & Phòng Chăm Sóc Khách Hàng Viettel Post,

Tôi là chủ tài khoản bán hàng tại Viettel Post. Tôi làm đơn này khiếu nại về các khoản cước phát sinh sai lệch trong bảng kê chi tiết:
- Đơn hàng bị đội trọng lượng tính cước bất thường.
- Các khoản phụ phí dịch vụ phát sinh ngoài bảng giá cam kết.
- Hàng chuyển hoàn bị ngâm tại bưu cục phát/trung tâm khai thác quá hạn.

Kính đề nghị Viettel Post kiểm tra lại toàn bộ mã vận đơn trong file đính kèm và hoàn trả số tiền cước thu sai theo đúng hợp đồng hợp tác.

Trân trọng!`,

  "J&T": `Kính gửi CSKH & Bộ Phận Đối Soát J&T Express Việt Nam,

Shop kính gửi danh sách các đơn hàng phát sinh sai lệch cước vận chuyển và hàng hoàn cần kiểm tra:
1. Lỗi chênh lệch cân nặng: Trọng lượng tính cước trên hệ thống cao hơn đáng kể so với thực tế cân tại shop khi đóng gói.
2. Đơn hoàn ngâm kho: Kiện hàng chuyển hoàn không được phát trả đúng hạn, có dấu hiệu thất lạc.

Yêu cầu J&T hoàn cước chênh lệch và cập nhật hướng xử lý bồi thường trong vòng 48h. File mã đơn chi tiết đính kèm.

Trân trọng!`,

  "Shopee Xpress": `Kính gửi Bộ phận Hỗ trợ Người Bán Shopee Xpress (SPX),

Shop yêu cầu hỗ trợ kiểm tra lại phí vận chuyển bị trừ sai lệch trong bảng sao kê đơn hàng:
- Hệ thống trừ tiền cước vượt mức thực tế do ghi nhận sai thể tích/trọng lượng kiện hàng.
- Một số đơn hoàn trả chưa nhận được hàng nhưng đã chuyển trạng thái hoàn tất hoàn hàng.

Đề nghị SPX kiểm tra lại log cân tại hub và hoàn lại số tiền chênh lệch vào Số Dư Tài Khoản Shopee của shop. Mã đơn chi tiết đính kèm.

Trân trọng!`,

  "TikTok Shop": `Kính gửi Bộ phận Hỗ trợ Nhà Bán Hàng TikTok Shop / Đơn vị vận chuyển liên kết,

Shop xin gửi yêu cầu khiếu nại cước vận chuyển và đơn hoàn hàng:
- Cước phí vận chuyển thực tế bị trừ cao hơn mức dự kiến do hãng vận chuyển cập nhật sai số đo/cân nặng.
- Đơn hàng trả về bị lưu kho quá hạn không được trả về địa chỉ kho shop.

Yêu cầu hỗ trợ rà soát lại dữ liệu cân đo và bồi hoàn chi phí chênh lệch vào ví nhà bán hàng. Danh sách mã đơn đính kèm.

Trân trọng!`
};

/**
 * Tạo mẫu thư khiếu nại / tin nhắn Zalo gửi CSKH
 */
export function generateDisputeTemplate({ carrier, totalAmount, count, topTrackingCodes }) {
  return `Kính gửi Bộ phận Chăm sóc khách hàng & Đối soát của ${carrier},

Tôi là chủ tài khoản bán hàng tại ${carrier}.
Qua quá trình kiểm toán và đối soát dữ liệu kỳ vừa qua, hệ thống của chúng tôi phát hiện ${count} đơn hàng có sự sai lệch nghiêm trọng về cân nặng tính cước, thất lạc hàng hoàn và các khoản phụ phí bất thường.

- Tổng số tiền đề nghị kiểm tra và hoàn trả: ${totalAmount.toLocaleString('vi-VN')} VNĐ
- Một số mã vận đơn tiêu biểu: ${topTrackingCodes.join(', ')} (Kèm theo danh sách chi tiết trong file Excel đính kèm).

Theo đúng quy định và chính sách bồi hoàn của ${carrier}:
1. Đối với các đơn nhảy nấc cân nặng vô lý: Đề nghị kiểm tra lại camera băng chuyền quét thể tích và hoàn cước chênh lệch.
2. Đối với các kiện chuyển hoàn quá 72h không cập nhật hành trình: Đề nghị bưu cục giao trả hàng trong 24h tới hoặc tiến hành thủ tục bồi thường 100% giá trị hàng hóa.

Rất mong quý công ty xử lý và phản hồi bằng văn bản/email trong vòng 48 giờ làm việc.

Trân trọng!`;
}
