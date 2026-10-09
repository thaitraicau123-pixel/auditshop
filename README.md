# SoatDon.vn - Phần Mềm Đối Soát & Kiểm Toán Thất Thoát Cho Shop Online (MVP B2B)

Dự án Micro-SaaS B2B dành cho các chủ shop kinh doanh trực tuyến tại Việt Nam (Shopee, TikTok Shop, Facebook Ads, GHTK, GHN, Viettel Post, SPX...).

## 🎯 Giá trị cốt lõi & Nỗi đau giải quyết
- **Kê khống trọng lượng tính cước:** Phát hiện đơn gói 200g bị hãng cân lên 700g - 1kg (nhảy 2 nấc cước +15k - 20k).
- **Hàng hoàn ngâm quá hạn 72h:** Phát hiện các đơn chuyển hoàn bị giam bưu cục quá lâu có nguy cơ mất hàng/tráo hàng cần đòi bồi thường gấp.
- **Phụ phí bất thường & Lệch tiền COD:** Phát hiện phí lưu kho, phụ phí vùng sâu vùng xa ảo hoặc lệch tiền chuyển khoản thu hộ.
- **Tự động xuất đơn khiếu nại:** Xuất file Excel chuẩn và mẫu văn bản đòi tiền để gửi bưu cục duyệt tiền hoàn trong 48h.

## 🚀 Cách chạy ứng dụng
Thư mục dự án: `C:\Users\admin\.gemini\antigravity\scratch\auditshop`

1. Cài đặt thư viện: `npm install`
2. Chạy môi trường phát triển: `npm run dev`
3. Truy cập: `http://localhost:3000`

## 💰 Cơ chế thu tiền & Mở khóa (Monetization)
- **Freemium:** Quét miễn phí bảng kê để hiện tổng tiền thất thoát và 3 đơn đầu tiên làm bằng chứng xác thực.
- **Paywall:** 
  - Gói Mở khóa 1 file: **49.000 đ**
  - Gói Shop Tăng Trưởng (Thuê bao tháng): **199.000 đ / tháng**
  - Gói Trọn Đời (Lifetime VIP): **999.000 đ**
- **Cấu hình tài khoản nhận tiền thật:** Mở file `src/components/PaymentModal.jsx`, sửa lại các thông tin:
  - `bankAccount`: Số tài khoản ngân hàng của bạn
  - `bankName`: Tên ngân hàng (MBBank, Vietcombank, Techcombank...)
  - `accountHolder`: Tên chủ tài khoản

## 🎬 Kịch bản quay TikTok / Reels kéo khách (0 đồng)
1. **Mở đầu (3s):** Quay màn hình trang web `http://localhost:3000`, chỉ tay vào thông báo đỏ rực: *"Phát hiện shop bị trừ oan 1.450.000đ từ 15 đơn hàng"*.
2. **Thân bài (20s):** Bấm vào 1 mã đơn cụ thể cho người xem thấy: *"Áo thun có 250g mà bên vận chuyển cân lên tận 850g, mỗi đơn mất toi 16k tiền cước"*.
3. **Kêu gọi hành động (10s):** *"Bác nào bán Shopee, TikTok Shop muốn check xem tháng này có bị mất tiền oan không thì vào web quét thử miễn phí nhé, link ở bio!"*.
