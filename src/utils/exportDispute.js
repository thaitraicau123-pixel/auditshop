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
